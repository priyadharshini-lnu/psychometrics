# frozen_string_literal: true

module Sheets
  class CreateFlatSheetView < BaseCommand
    private_attr_reader :sheet

    def initialize(sheet)
      @sheet = sheet
    end

    def call
      select_query = flat_rows_query
      return broadcast :ok unless select_query

      create_view_query = "CREATE VIEW #{flat_row_view_name} AS #{select_query}"
      sha = Digest::SHA2.hexdigest(create_view_query)
      return broadcast :ok if sha == sheet.flat_view_sha

      ActiveRecord::Base.connection.execute("CREATE SCHEMA IF NOT EXISTS #{schema_name}")
      ActiveRecord::Base.connection.execute("DROP VIEW IF EXISTS #{flat_row_view_name}")
      ActiveRecord::Base.connection.execute(create_view_query)
      sheet.update!(flat_view_sha: sha)

      broadcast :ok
    end

    private

    def schema_name
      "c_#{sheet.campaign_id}"
    end

    def flat_row_view_name
      "\"#{schema_name}\".#{sheet.type.downcase}"
    end

    def flat_rows_query
      valid_columns = sheet.sheet_columns.select do |column|
        (sheet.accesssheet? || column.dashboard_use) && column.name != 'Email' &&
          column.name.length <= Sheet::MAX_COLUMN_NAME_SIZE
      end
      return if valid_columns.empty?

      columns_query = valid_columns.filter_map do |column|
        type = column.column_type == 'number' ? 'float' : 'text'
        column_name = column.name
        quote_escaped_column = ActiveRecord::Base.connection.quote_string(column_name)
        "(data->>'#{quote_escaped_column}')::#{type} as \"#{column_name.gsub('"', '""')}\""
      end.join(", \n")

      <<-SQL.squish
        SELECT id, email as "Email", #{columns_query}
        FROM sheet_rows
        WHERE sheet_id = #{sheet.id}
        ORDER BY id
      SQL
    end
  end
end
