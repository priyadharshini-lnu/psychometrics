# frozen_string_literal: true

module Questions
  class Validation < BaseCommand
    attr_accessor :question, :value, :locale

    VALIDATIONS = {
      Custom: Questions::Validations::CustomValidation
    }.with_indifferent_access.freeze

    def initialize(question, value, locale = :en)
      @question = question
      @value = value
      @locale = locale
    end

    def call
      type = question.validation['type']

      return broadcast(:ok, nil) if type == 'None'

      return broadcast(:ok, nil) unless VALIDATIONS[type]

      broadcast :ok, VALIDATIONS[type].call!(question, value, locale)
    end
  end
end
