# frozen_string_literal: true

class DatasheetRowQuery < Rectify::Query
  private_attr_reader :project_ids, :campaign_ids, :limit, :offset

  DEFAULT_COLUMN_NAMES = [
    'ID', 'Email', 'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name'
  ].freeze

  def initialize(project_ids: [], campaign_ids: [], limit: nil, offset: nil)
    @campaign_ids = campaign_ids
    @project_ids = project_ids
    @limit = limit
    @offset = offset
  end

  def query(only_count: false)
    return DatasheetRow.none if project_ids.blank? && campaign_ids.blank?

    sql = <<-SQL.squish
      SELECT
        #{only_count ? 'count(*)' : select_clause_columns}
      FROM sheet_rows
      LEFT JOIN sheets ON sheet_rows.sheet_id = sheets.id
      LEFT JOIN (#{crosstab_query}) AS sheet_data ON sheet_rows.id = sheet_data.sheet_row_id
      LEFT JOIN campaigns ON sheets.campaign_id = campaigns.id
      LEFT JOIN clients sheet_project ON sheets.project_id = sheet_project.id
      LEFT JOIN clients campaign_project ON campaigns.project_id = campaign_project.id
      WHERE sheets.id IN (:datasheet_ids)
    SQL
    if limit && offset
      sql = "#{sql} LIMIT :limit OFFSET :offset"
    end

    ActiveRecord::Base.connection.execute(
      ApplicationRecord.sanitize_sql([
        sql,
        { datasheet_ids: datasheet_ids, limit: limit, offset: offset }
      ])
    )
  end

  def crosstab_query
    <<~SQL.squish
      SELECT * FROM crosstab(
        $$
          SELECT srd.sheet_row_id, sheet_columns.name,
            CASE WHEN srd.numeric_value is not null
              THEN srd.numeric_value::text
              ELSE srd.string_value
            END
          FROM sheet_row_data srd
          LEFT JOIN sheet_columns on sheet_columns.id = srd.sheet_column_id
          where sheet_columns.name in (#{escaped_column_names.map { |cn| "'#{cn}'" }.join(', ')}) and
          sheet_columns.sheet_id in (:datasheet_ids)
          ORDER BY 1
        $$,
        $$
          VALUES #{escaped_column_names.map { |cn| "('#{cn}')" }.join(', ')}
        $$
      ) AS final_result(sheet_row_id BIGINT, #{escaped_column_names.map { |cn| "\"#{cn}\" TEXT" }.join(', ')})
    SQL
  end

  def total_count
    return 0 if project_ids.blank? && campaign_ids.blank?

    query(only_count: true).first['count']
  end

  def select_clause_columns
    <<-SQL.squish
      DISTINCT sheet_rows.id as "ID",
      sheet_rows.email "Email",
      COALESCE(sheet_project.id, campaign_project.id) "Project ID",
      COALESCE(sheet_project.name, campaign_project.name) "Project Name",
      campaigns.id "Campaign ID",
      campaigns.name "Campaign Name",
      #{sheet_rows_data_columns_for_select}
    SQL
  end

  def escaped_column_names
    datasheet_column_names.map do |column_name|
      ActiveRecord::Base.connection.quote_string(column_name)
    end
  end

  def sheet_rows_data_columns_for_select
    datasheet_column_names.map do |column_name|
      quote_escaped_column = ActiveRecord::Base.connection.quote_string(column_name)
      column_name = DEFAULT_COLUMN_NAMES.include?(column_name) ? "#{column_name}_1" : column_name
      "sheet_data.\"#{quote_escaped_column}\" as \"#{column_name.gsub('"', '""')}\""
    end.join(', ')
  end

  def datasheet_column_names
    @datasheet_column_names if defined?(@datasheet_column_names)
    @datasheet_column_names = datasheets.map(&:sheet_columns).map do |columns|
      columns.map do |column|
        next if column.name == 'Email'

        column.name
      end
    end.flatten.compact.uniq.sort
  end

  def datasheet_ids
    datasheets.pluck(:id)
  end

  def datasheets
    sheet = Datasheet.none
    if project_ids.present? && campaign_ids.present?
      sheet = Datasheet.where(project_id: project_ids).or(Datasheet.where(campaign_id: campaign_ids))
    elsif project_ids.present?
      sheet = Datasheet.where(project_id: project_ids)
    elsif campaign_ids.present?
      sheet = Datasheet.where(campaign_id: campaign_ids)
    end
    sheet
  end
end
