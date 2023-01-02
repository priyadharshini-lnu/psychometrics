# frozen_string_literal: true

module Questions::Validations
  class CustomValidation < BaseCommand
    attr_accessor :conditions, :message, :value

    PREDICATERS = {
      MatchesRegexp: Questions::Validations::MatchRegexp
    }.with_indifferent_access.freeze

    def initialize(question, value, locale)
      validation = question.validation['customValidations'].first
      locales = Translation.to_hash_for_question(question.id, locale) || {}
      @conditions = validation['conditions']
      @message = locales["customValidationText_#{validation['uuid']}"] || validation['message']
      @value = value
    end

    def call
      invalid = conditions.all? do |condition|
        PREDICATERS[condition['predicate']].call!(condition['value'], value)
      end

      broadcast :ok, invalid ? [message] : nil
    end
  end
end
