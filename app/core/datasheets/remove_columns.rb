# frozen_string_literal: true

module Datasheets
  class RemoveColumns < BaseCommand
    private_attr_reader :datasheet, :columns

    def initialize(datasheet, columns)
      @datasheet = datasheet
      @columns = columns
    end

    def call
      transaction do
        datasheet.columns.reject! { |col| columns.include?(col['name']) }
        datasheet.save!
        datasheet.rows.update_all("data = data - ARRAY['#{columns.join('\',\'')}']")
      end
      broadcast :ok, datasheet.columns
    end
  end
end
