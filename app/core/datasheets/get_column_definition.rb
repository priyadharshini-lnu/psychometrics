# frozen_string_literal: true

module Datasheets
  class GetColumnDefinition < BaseCommand
    private_attr_reader :datasheet, :visible_columns

    def initialize(datasheet)
      @datasheet = datasheet
      @visible_columns = datasheet.parent_resource.datasheet_column_preference&.visible_columns ||
                         [Datasheet::EMAIL_COLUMN]
    end

    def call
      columns = datasheet.columns
      columns = columns.map { |name, type| { id: name, type: type, visible: visible_columns.include?(name) } }

      broadcast :ok, columns
    end
  end
end
