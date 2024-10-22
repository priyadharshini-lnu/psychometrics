# frozen_string_literal: true

class SheetRowDatum < ApplicationRecord
  belongs_to :sheet_row
  belongs_to :sheet_column

  def value=(val)
    if column.column_type == 'number'
      sheet_column.numeric_value = val
    else
      sheet_column.string_value = val
    end
  end
end
