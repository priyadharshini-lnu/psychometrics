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
        removed_columns = sheet.sheet_columns.where(id: column_ids).pluck(:name).join("','")
        sheet.sheet_columns.where(id: column_ids).destroy_all
        sheet.rows.update_all("data = data - ARRAY['#{ActiveRecord::Base.sanitize_sql(removed_columns)}']")
      end
      broadcast :ok
    end
  end
end
