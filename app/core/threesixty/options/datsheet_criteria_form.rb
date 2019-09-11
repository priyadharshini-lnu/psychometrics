# frozen_string_literal: true

module Threesixty
  module Options
    class DatsheetCriteriaForm < Rectify::Form
      attribute :criteria_list

      validate :validate_data_sheet_criteria

      def validate_data_sheet_criteria
        criteria_list.each do |criteria|
          validate_criteria_keys(criteria)
          validate_criteria_comparator(criteria[:comparator])
          validate_criteria_field(criteria[:field])
        end
      end

      def validate_criteria_comparator(comparator)
        errors.add(:criteria_list, 'has invalid comparator') if %w[equal is_same_as_subject].exclude?(comparator)
      end

      def validate_criteria_field(field)
        errors.add(:criteria_list, 'has invalid conditional field') if context.datasheet_column_names.exclude?(field)
      end

      def validate_criteria_keys(criteria)
        errors.add(:criteria_list, 'has invalid key') if (criteria.keys - %i[field comparator value]).present?
      end
    end
  end
end
