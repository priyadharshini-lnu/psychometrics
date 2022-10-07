# frozen_string_literal: true

module Sheets
  class RemoveColumns < BaseCommand
    private_attr_reader :sheet, :columns

    def initialize(sheet, columns)
      @sheet = sheet
      @columns = columns
    end

    def call
      transaction do
        sheet.columns.reject! { |col| columns.include?(col['name']) }
        sheet.save!
        sheet.rows.update_all("data = data - ARRAY['#{columns.join('\',\'')}']")
      end
      broadcast :ok, sheet.columns
    end
  end
end
