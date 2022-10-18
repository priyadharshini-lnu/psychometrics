# frozen_string_literal: true

module Questions
  class Validation < BaseCommand
    attr_accessor :question, :value

    VALIDATIONS = {
      Custom: Questions::Validations::CustomValidation
    }.with_indifferent_access.freeze

    def initialize(question, value)
      @question = question
      @value = value
    end

    def call
      type = question.validation['type']

      return broadcast(:ok, nil) if type == 'None'

      return broadcast(:ok, nil) unless VALIDATIONS[type]

      broadcast :ok, VALIDATIONS[type].call!(question.validation['customValidations'], value)
    end
  end
end
