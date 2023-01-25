# frozen_string_literal: true

module Questions::Validations
  class AnswerRange < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || []
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['maxValue'] && args['minValue']

      invalid = value.size < args['minValue'] || value.size > args['maxValue']

      broadcast :ok, invalid && [I18n.t('validations.must_select', min: args['minValue'], max: args['maxValue'])]
    end
  end
end
