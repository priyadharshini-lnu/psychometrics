# frozen_string_literal: true

module Questions::Validations
  class CustomValidation < BaseCommand
    attr_accessor :conditions, :message, :value

    PREDICATERS = {
      MatchesRegexp: Questions::Validations::MatchRegexp
    }.with_indifferent_access.freeze

    def initialize(validations, value)
      @conditions = validations.first['conditions']
      @message = validations.first['message']
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
