# frozen_string_literal: true

module Sheets
  class UpdateColumnPositions < BaseCommand
    private_attr_reader :sheet, :columns

    def initialize(sheet, columns)
      @sheet = sheet
      @columns = columns.map.with_index { |c, index| [c[:id], { position: index }] }.to_h
    end

    def call
      transaction do
        SheetColumn.acts_as_list_no_update do
          SheetColumn.update(columns.keys, columns.values)
        end
      end
      broadcast :ok
    end
  end
end
