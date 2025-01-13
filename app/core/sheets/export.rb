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

      result = Axlsx::Package.new do |package|
        package.workbook.add_worksheet(name: 'Datasheet') do |sheet|
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
      end

      broadcast :ok, result
    end
  end
end
