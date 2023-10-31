# frozen_string_literal: true

class SheetRow < ApplicationRecord
  audited

  belongs_to :sheet, inverse_of: :rows

  before_save { self.email = email&.downcase }

  delegate :columns, to: :sheet

  def datasheet
    sheet
  end

  def log_attribute_for_delete
    slice(:id, :email, :data)
  end
end
