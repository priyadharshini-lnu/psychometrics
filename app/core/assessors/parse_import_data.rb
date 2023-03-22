# frozen_string_literal: true

module Assessors
  class ParseImportData < BaseCommand
    private_attr_reader :import_data

    def initialize(import_data)
      @import_data = import_data
    end

    def call
      csv =
        if import_data.is_a?(ActionDispatch::Http::UploadedFile) || import_data.is_a?(Rack::Test::UploadedFile)
          CSV.read(import_data.path, encoding: 'bom|utf-8', headers: true)
        else
          CSV.new(URI(import_data.url).open, headers: true).read
        end
      rows = csv.map { |row| row.to_h.symbolize_keys }.map do |row|
        row[:assessment_ids] = (row[:assessment_ids] || '').split(',').map(&:to_i)
        row
      end
      broadcast :ok, rows
    end
  end
end
