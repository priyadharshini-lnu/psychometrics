# frozen_string_literal: true

module SheetRows
  class UpsertData < BaseCommand
    private_attr_accessor :sheet, :email, :data

    def initialize(sheet, email, data)
      @sheet = sheet
      @email = email
      @data = data
    end

    def call
      transaction do
        upsert_rows
      end

      broadcast :ok
    end

    private

    def sheet_row
      @sheet_row ||= sheet.rows.find_or_create_by!(email: email)
    end

    def upsert_rows
      data['Email'] = email unless data.key?('Email')
      data.each do |field, value|
        column = sheet_columns[field]
        next unless column

        row_data = sheet_row.sheet_row_data.find_or_initialize_by(sheet_column: column)
        row_data.value = value
        row_data.save!
      end
    end

    def sheet_columns
      @sheet_columns ||= sheet.sheet_columns.index_by(&:name)
    end
  end
end
