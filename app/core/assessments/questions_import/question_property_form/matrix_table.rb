# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class MatrixTable < Base
        mimic :questions_import_matrix_table_form

        attribute :type, String
        attribute :answersType, String
        attribute :choicesTexts, Array, default: []
        attribute :scalePointsTexts, Array, default: []

        validates :type, :answersType, presence: true
        validates :type, inclusion: { in: ['Likert'] }, if: -> { type.present? }
        validates :answersType, inclusion: { in: %w[SingleAnswer MultipleAnswer] }, if: -> { answersType.present? }

        def attributes
          super.merge({
            'choices' => choicesTexts.length,
            'scalePoints' => scalePointsTexts.length
          })
        end
      end
    end
  end
end
