# frozen_string_literal: true

module Threesixty
  module Options
    class DatsheetCriteriaForm < Rectify::Form
      attribute :criteria_list

      validate :validate_data_sheet_criteria

      def validate_data_sheet_criteria
        criteria_list.each do |criteria|
          validate_criteria_keys(criteria)
          validate_criteria_operator(criteria[:operator])
          validate_criteria_field(criteria[:field])
        end
      end

      def validate_criteria_operator(operator)
        if ['equal', 'is_same_as_subject'].exclude?(operator)
          errors.add(:criteria_list, 'has invalid operator')
        end
      end

      def validate_criteria_field(field)
        if context.datasheet_column_names.exclude?(field)
          errors.add(:criteria_list, 'has invalid conditional field')
        end
      end

      def validate_criteria_keys(criteria)
        if (criteria.keys - [:field, :operator, :value]).present?
          errors.add(:criteria_list, 'has invalid key')
        end
      end
    end
  end
end
