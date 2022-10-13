# frozen_string_literal: true

module Sheets
  class AccesssheetColumnForm < BaseColumnForm
    validates :name, :type, presence: true, format: { with: RegexConstants::SHEET_COLUMN_REGEX }
    validates_length_of :name, maximum: Sheet::MAX_COLUMN_NAME_SIZE
  end
end
