# frozen_string_literal: true

module Dashboards
  class CreateFlatSheetView < BaseCommand
    private_attr_reader :sheet

    def initialize(sheet)
      @sheet = sheet
    end

    def call
      ActiveRecord::Base.connection.execute("DROP VIEW IF EXISTS #{flat_row_view_name}")
      ActiveRecord::Base.connection.execute("CREATE VIEW #{flat_row_view_name} AS #{flat_rows_query}")

      broadcast :ok
    end

    private

    def flat_row_view_name
      "c_#{sheet.campaign_id}_#{sheet.type.downcase}"
    end

    def flat_rows_query
      valid_columns = sheet.columns.except('Email').select { |column, _| column.length < 64 }.map do |column, type|
        type = type == 'Number' ? 'float' : 'text'
        next unless /\A[\w\s]+\z/.match?(column)

        "(data->>'#{column}')::#{type} as \"#{column}\""
      end.compact.join(", \n")

      <<-SQL.squish
        SELECT id, email as "Email", #{valid_columns}
        FROM datasheet_rows
        WHERE datasheet_id = #{sheet.id}
        ORDER BY id
      SQL
    end
  end
end
