# frozen_string_literal: true

module Questions::Validations
  class MinLength < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || ''
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['minLength']

      invalid = value.length < args['minLength']

      broadcast :ok, invalid ? [I18n.t('validations.min_character', min: args['minLength'])] : nil
    end
  end
end
