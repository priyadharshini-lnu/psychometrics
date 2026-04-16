# frozen_string_literal: true

module Questions::Validations
  class CustomValidation < BaseCommand
    attr_accessor :conditions, :message, :value

    PREDICATERS = {
      EqualTo: Questions::Validations::Custom::EqualTo,
      NotEqualTo: Questions::Validations::Custom::NotEqualTo,
      GreaterThen: Questions::Validations::Custom::GreaterThan,
      GreaterThenOrEqual: Questions::Validations::Custom::GreaterThanOrEqual,
      LessThen: Questions::Validations::Custom::LessThan,
      LessThenOrEqual: Questions::Validations::Custom::LessThanOrEqual,
      Empty: Questions::Validations::Custom::Empty,
      NotEmpty: Questions::Validations::Custom::NotEmpty,
      Contains: Questions::Validations::Custom::Contains,
      DoesNotContains: Questions::Validations::Custom::DoesNotContains,
      Selected: Questions::Validations::Custom::Selected,
      NotSelected: Questions::Validations::Custom::NotSelected,
      MatchesRegexp: Questions::Validations::Custom::MatchRegexp
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
        predicate_handler = PREDICATERS[condition['predicate']]
        # Skip validation if predicate handler is not defined
        next false if predicate_handler.nil?

        !predicate_handler.call!(condition, value)
      end

      broadcast :ok, invalid ? [message] : nil
    end
  end
end
