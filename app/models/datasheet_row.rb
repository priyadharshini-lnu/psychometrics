# frozen_string_literal: true

class DatasheetRow < ApplicationRecord
  audited

  belongs_to :datasheet, inverse_of: :rows

  before_save { self.email = email&.downcase }

  delegate :columns, to: :datasheet

  def log_attribute_for_delete
    slice(:id, :email, :data)
  end
end
