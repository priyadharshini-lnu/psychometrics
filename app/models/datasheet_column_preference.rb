# frozen_string_literal: true

class DatasheetColumnPreference < ApplicationRecord
  belongs_to :resource, polymorphic: true
end
