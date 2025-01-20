# frozen_string_literal: true

module Sheets
  class Export < BaseCommand
    private_attr_reader :datasheet

    def initialize(datasheet)
      @datasheet = datasheet
    end

    def call
      columns = datasheet.sheet_columns
      column_names = columns.map(&:name)
      coulmn_types = columns.map(&:humanize_type)

      package = ExcelSafe.new

      package.add_worksheet('Datasheet') do |sheet|
        sheet.add_row column_names
        sheet.add_row coulmn_types
        result = DatasheetDataQuery.new(datasheet).query

        result.each do |data|
          row_data = column_names.map do |column|
            data[column]
          end

          sheet.add_row row_data
        end
      end

      broadcast :ok, package
    end
  end
end
