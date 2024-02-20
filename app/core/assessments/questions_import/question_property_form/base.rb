# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class Base < Rectify::Form
        DEFAULT_PROPS_FOR_ALL_QUESTION_TYPES = {
          'defaultValues' => []
        }.freeze

        attribute :questionText, String, default: 'Click to write the question text'
        attribute :randomization, Hash, default: { 'type' => 'No' }

        validate :validate_randomization

        def validate_randomization
          return if randomization.blank?

          form = RandomizationProperty.new(randomization)
          errors.add(:randomization, form.errors.messages.values.join(', ')) unless form.valid?
        end

        def attributes
          default = DEFAULT_PROPS_FOR_ALL_QUESTION_TYPES
          default = default.deep_merge(default_values) if respond_to?(:default_values)
          default.deep_merge(super)
        end
      end
    end
  end
end
