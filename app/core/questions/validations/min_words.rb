# frozen_string_literal: true

module Questions::Validations
  class MinWords < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || ''
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['minLength']

      invalid = value.split(/\s+/).size < args['minLength']

      broadcast :ok, invalid ? [I18n.t('validations.min_word', min: args['minLength'])] : nil
    end
  end
end
