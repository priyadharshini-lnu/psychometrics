# frozen_string_literal: true

module Sheets
  class BaseColumnForm < Rectify::Form
    attribute :name, String
    attribute :type, String
    attribute :visible_in_list, Boolean

    validates_inclusion_of :type, in: Sheet::ALL_COLUMN_TYPES
    validate :uniqueness_field_name, if: :sheet

    def uniqueness_field_name
      errors.add(:name, :not_unique) if context.form_type == :add && existing_column
    end

    def existing_column
      sheet&.columns&.find { |f| f['name'] == name }
    end

    def sheet
      context&.sheet
    end
  end
end
