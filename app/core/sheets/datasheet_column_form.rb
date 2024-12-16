# frozen_string_literal: true

module Sheets
  class DatasheetColumnForm < BaseColumnForm
    mimic :column

    attribute :dashboard_use, Boolean
    attribute :accessor_access, Boolean

    validates_length_of :name, maximum: Sheet::MAX_COLUMN_NAME_SIZE, if: -> { dashboard_use }
    validates :name, presence: true
  end
end
