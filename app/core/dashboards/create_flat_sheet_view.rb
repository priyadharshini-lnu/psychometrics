# frozen_string_literal: true

module Dashboards
  class CreateFlatSheetView < BaseCommand
    private_attr_reader :sheet

    def initialize(sheet)
      @sheet = sheet
    end

    def call
      ActiveRecord::Base.connection.execute("DROP VIEW IF EXISTS #{flat_row_view_name}")
      view_query = flat_rows_query
      ActiveRecord::Base.connection.execute("CREATE VIEW #{flat_row_view_name} AS #{view_query}") if view_query

      broadcast :ok
    end

    private

    def flat_row_view_name
      "c_#{sheet.campaign_id}_#{sheet.type.downcase}"
    end

    def flat_rows_query
      valid_columns = sheet.columns.select do |column|
        column['dashboard_use'] && column['name'] != 'Email' && column.length < Sheet::MAX_COLUMN_NAME_SIZE &&
          /\A[\w\s]+\z/.match?(column['name'])
      end
      return if valid_columns.empty?

      columns_query = valid_columns.map do |column|
        type = column['type'] == 'Number' ? 'float' : 'text'
        column_name = column['name']
        "(data->>'#{column_name}')::#{type} as \"#{column_name}\""
      end.compact.join(", \n")

      <<-SQL.squish
        SELECT id, email as "Email", #{columns_query}
        FROM sheet_rows
        WHERE sheet_id = #{sheet.id}
        ORDER BY id
      SQL
    end
  end
end
