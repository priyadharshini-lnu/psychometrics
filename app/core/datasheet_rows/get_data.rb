# frozen_string_literal: true

module DatasheetRows
  class GetData < BaseCommand
    private_attr_reader :datasheet_row, :opts

    def initialize(datasheet_row, opts = {})
      @datasheet_row = datasheet_row
      @opts = opts
    end

    def call
      default_column_attr = { id: datasheet_row.id, 'Email' => datasheet_row.email }

      valid_columns = (opts[:datasheet] || datasheet_row.datasheet).columns
      valid_columns = valid_columns.select { |_, v| opts[:without_types].exclude?(v) } if opts[:without_types]
      data = datasheet_row.data.slice(*valid_columns.keys)

      broadcast :ok, default_column_attr.merge(data)
    end
  end
end
