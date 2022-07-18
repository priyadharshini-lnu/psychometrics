# frozen_string_literal: true

class SheetRow < ApplicationRecord
  belongs_to :sheet, foreign_key: :sheet_id, inverse_of: :rows

  before_save { self.email = email&.downcase }

  delegate :columns, to: :sheet

  def datasheet
    sheet
  end

  def log_attribute_for_delete
    slice(:id, :email, :data)
  end
end
