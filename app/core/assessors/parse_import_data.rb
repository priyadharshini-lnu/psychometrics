# frozen_string_literal: true

module Assessors
  class ParseImportData < BaseCommand
    private_attr_reader :import_data

    def initialize(import_data)
      @import_data = import_data
    end

    def call
      csv_result = ::CsvFileParser.call!(import_data, headers: :first_row)
      rows = csv_result.map { |row| row.to_h.symbolize_keys }.map do |row|
        row[:assessment_ids] = (row[:assessment_ids] || '').split(',').map(&:to_i)
        row
      end
      broadcast :ok, rows
    end
  end
end
