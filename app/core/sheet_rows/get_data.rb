# frozen_string_literal: true

module SheetRows
  class GetData < BaseCommand
    private_attr_reader :datasheet_row, :opts

    def initialize(datasheet_row, opts = {})
      @datasheet_row = datasheet_row
      @opts = opts
    end

    def call
      default_column_attr = { id: datasheet_row.id }

      valid_columns = (opts[:sheet] || datasheet_row.sheet).sheet_columns
      if opts[:without_types]
        valid_columns = valid_columns.select do |column|
          opts[:without_types].exclude?(column.column_type)
        end
      end
      rows = datasheet_row.sheet_row_data.where(sheet_column_id: valid_columns)
      data = rows.each_with_object(default_column_attr) do |datum, acc|
        acc[datum.sheet_column.name] = datum.value
        acc
      end
      broadcast :ok, default_column_attr.merge(data)
    end
  end
end
