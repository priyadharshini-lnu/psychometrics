# frozen_string_literal: true

module Datasheets
  class Export < BaseCommand
    private_attr_reader :datasheet

    def initialize(datasheet)
      @datasheet = datasheet
    end

    def call
      column_definition = datasheet.columns

      column_names = column_definition.map { |c| c['name'] }
      coulmn_types = column_definition.map { |c| c['type'] }

      result = Axlsx::Package.new do |package|
        package.workbook.add_worksheet(name: 'Datasheet') do |sheet|
          sheet.add_row column_names
          sheet.add_row coulmn_types

          datasheet.rows.order(updated_at: :desc).each do |row|
            row_data = column_names.map do |column|
              column == Datasheet::EMAIL_COLUMN ? row.email : row.data[column]
            end

            sheet.add_row row_data
          end
        end
      end

      broadcast :ok, result
    end
  end
end
