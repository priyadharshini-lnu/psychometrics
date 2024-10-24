# frozen_string_literal: true

module Sheets
  class BaseColumnForm < Rectify::Form
    attribute :id, Integer
    attribute :name, String
    attribute :column_type, String
    attribute :visible_in_list, Boolean

    validates_inclusion_of :column_type, in: SheetColumn.column_types.keys
    validate :uniqueness_field_name, if: :sheet

    def uniqueness_field_name
      errors.add(:name, :not_unique) if context.form_type == :add && existing_column
    end

    def existing_column
      sheet.sheet_columns.find_by(name: name)
    end

    def sheet
      context&.sheet
    end
  end
end
