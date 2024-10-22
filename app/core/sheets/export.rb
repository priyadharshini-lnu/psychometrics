# frozen_string_literal: true

module Sheets
  class Export < BaseCommand
    private_attr_reader :datasheet

    def initialize(datasheet)
      @datasheet = datasheet
    end

    def call
      column_definition = datasheet.sheet_columns

      column_names = column_definition.map(&:name)
      coulmn_types = column_definition.map(&:humanize_type)

      result = Axlsx::Package.new do |package|
        package.workbook.add_worksheet(name: 'Datasheet') do |sheet|
          sheet.add_row column_names
          sheet.add_row coulmn_types

          datasheet.rows.order(updated_at: :desc).each do |row|
            row_data = column_names.map do |column|
              column == Sheet::EMAIL_COLUMN ? row.email : row.data[column]
            end

            sheet.add_row row_data
          end
        end
      end

      broadcast :ok, result
    end
  end
end
