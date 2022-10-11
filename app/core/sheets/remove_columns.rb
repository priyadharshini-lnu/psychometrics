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
        new_columns = columns.map { |c| ActiveRecord::Base.connection.quote_string(c) }.join("','")
        sheet.rows.update_all("data = data - ARRAY['#{new_columns}']")
      end
      broadcast :ok, sheet.columns
    end
  end
end
