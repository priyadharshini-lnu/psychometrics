# frozen_string_literal: true

class DatasheetRow < ApplicationRecord
  belongs_to :datasheet, inverse_of: :rows
end
