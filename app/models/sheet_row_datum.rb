# frozen_string_literal: true

class SheetRowDatum < ApplicationRecord
  belongs_to :sheet_row
  belongs_to :sheet_column
  include Tenantable

  tenant_source :sheet_row

  def value
    if sheet_column.number?
      numeric_value
    else
      string_value
    end
  end

  def value=(val)
    if sheet_column.number?
      self.numeric_value = val
    else
      self.string_value = val
    end
  end
end
