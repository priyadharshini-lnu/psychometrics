# frozen_string_literal: true

module Sheets
  class BaseColumnForm < Rectify::Form
    attribute :name, String
    attribute :type, String
    attribute :visible_in_list, Boolean

    validates :name, :type, presence: true, format: { with: /\A[\w\s]+\z/ }
    validates_length_of :name, maximum: Sheet::MAX_COLUMN_NAME_SIZE
    validates_inclusion_of :type, in: Sheet::ALL_COLUMN_TYPES
    validate :uniqueness_field_name, if: :sheet

    def uniqueness_field_name
      errors.add(:name, :not_unique) if sheet.columns.find { |f| f['name'] == name }
    end

    def sheet
      context&.sheet
    end
  end
end
