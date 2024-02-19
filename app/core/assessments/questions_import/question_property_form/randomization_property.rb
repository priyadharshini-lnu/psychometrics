# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class RandomizationProperty < Rectify::Form
        mimic :questions_import_randomization_property_form

        attribute :type, String
        attribute :questions, Integer

        validates :type, presence: true
        validates :questions, presence: true, if: -> { type == 'Some' }
        validates :type, inclusion: { in: %w[All Some No] }
      end
    end
  end
end
