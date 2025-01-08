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

        datasheet.rows.order(updated_at: :desc).each do |row|
          rows = row.sheet_row_data.to_a
          row_data = columns.map do |column|
            rows.find { |r| r.sheet_column_id == column.id }&.value
          end

          sheet.add_row row_data
        end
      end

      broadcast :ok, package
    end
  end
end
