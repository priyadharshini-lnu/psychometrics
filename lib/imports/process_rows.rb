# frozen_string_literal: true

module Imports
  class ProcessRows < BaseCommand
    private_attr_reader :rows

    def initialize(rows)
      @rows = rows
    end

    def call
      headers = rows[0]

      processed_rows = []

      rows[1..].each do |row|
        row_hash = {}

        row.each_with_index do |value, index|
          header = headers[index].tr(' ', '_').downcase

          row_hash[header] = value
        end

        processed_rows << row_hash
      end

      broadcast :ok, processed_rows
    end
  end
end
