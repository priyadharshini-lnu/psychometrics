# frozen_string_literal: true

module Sheets
  class RemoveColumns < BaseCommand
    private_attr_reader :sheet, :column_ids

    def initialize(sheet, column_ids)
      @sheet = sheet
      @column_ids = column_ids
    end

    def call
      transaction do
        sheet.sheet_columns.where(id: column_ids).destroy_all
      end
      broadcast :ok
    end
  end
end
