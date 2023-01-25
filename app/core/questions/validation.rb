# frozen_string_literal: true

module Questions
  class Validation < BaseCommand
    attr_accessor :question, :value, :locale

    VALIDATIONS = {
      MinLength: Questions::Validations::MinLength,
      MaxLength: Questions::Validations::MaxLength,
      CharacterRange: Questions::Validations::CharacterRange,
      MinWords: Questions::Validations::MinWords,
      MaxWords: Questions::Validations::MaxWords,
      WordsRange: Questions::Validations::WordsRange,
      Least: Questions::Validations::Least,
      Most: Questions::Validations::Most,
      Range: Questions::Validations::AnswerRange,
      Exact: Questions::Validations::Exact,
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

      if question.validation['customValidations']
        return broadcast :ok, VALIDATIONS[type].call!(question, value, locale)
      end

      broadcast :ok, VALIDATIONS[type].call!(question.validation, value, locale)
    end
  end
end
