# frozen_string_literal: true

module SheetRows
  class GetData < BaseCommand
    private_attr_reader :datasheet_row, :opts

    def initialize(datasheet_row, opts = {})
      @datasheet_row = datasheet_row
      @opts = opts
    end

    def call
      default_column_attr = { id: datasheet_row.id, 'Email' => datasheet_row.email }

      valid_columns = (opts[:sheet] || datasheet_row.sheet).sheet_columns
      if opts[:without_types]
        valid_columns = valid_columns.select do |column|
          opts[:without_types].exclude?(column.humanize_type)
        end
      end
      data = datasheet_row.data.slice(*valid_columns.map(&:name))

      broadcast :ok, default_column_attr.merge(data)
    end
  end
end
