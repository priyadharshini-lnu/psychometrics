# frozen_string_literal: true

class DatasheetRow < ApplicationRecord
  belongs_to :datasheet, inverse_of: :rows

  before_save { self.email = email&.downcase }

  def log_attribute_for_delete
    slice(:id, :email, :data)
  end
end
