# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class MultipleChoice < Base
        mimic :questions_import_multiple_choice_form

        attribute :type, String
        attribute :choicesTexts, Array, default: []

        validates :type, presence: true
        validates :type, inclusion: { in: %w[SingleAnswer MultipleAnswer Dropdown] }, if: -> { type.present? }

        def attributes
          super.merge({
            'choices' => choicesTexts.length || 3
          })
        end
      end
    end
  end
end
