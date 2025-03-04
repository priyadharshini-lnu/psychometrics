# frozen_string_literal: true

class DatasheetDataQuery < Rectify::Query
  private_attr_reader :datasheet, :limit, :offset

  DEFAULT_COLUMN_NAMES = %w[ID Email].freeze

  def initialize(datasheet, limit: nil, offset: nil)
    @datasheet = datasheet
    @limit = limit
    @offset = offset
  end

  def query(only_count: false)
    sql = <<-SQL.squish
      SELECT
        #{only_count ? 'count(*)' : select_clause_columns}
      FROM sheet_rows
      LEFT JOIN sheets ON sheet_rows.sheet_id = sheets.id
      LEFT JOIN (#{crosstab_query}) AS sheet_data ON sheet_rows.id = sheet_data.sheet_row_id
      WHERE sheets.id IN (:datasheet_ids)
    SQL
    if limit && offset
      sql = "#{sql} LIMIT :limit OFFSET :offset"
    end

    ActiveRecord::Base.connection.execute(
      ApplicationRecord.sanitize_sql([
        sql,
        { datasheet_ids: datasheet.id, limit: limit, offset: offset }
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
    query(only_count: true).first['count']
  end

  def select_clause_columns
    <<-SQL.squish
      DISTINCT sheet_rows.id as "ID",
      sheet_rows.email "Email",
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
      column_name = "#{column_name}_1" if DEFAULT_COLUMN_NAMES.include?(column_name)
      "sheet_data.\"#{quote_escaped_column}\" as \"#{column_name.gsub('"', '""')}\""
    end.join(', ')
  end

  def datasheet_column_names
    return @datasheet_column_names if defined?(@datasheet_column_names)

    @datasheet_column_names = datasheet.sheet_columns.map do |column|
      next if column.name == 'Email'

      column.name
    end.flatten.compact.uniq.sort
  end
end
