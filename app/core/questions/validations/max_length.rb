# frozen_string_literal: true

module Questions::Validations
  class MaxLength < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || ''
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['maxLength']

      invalid = value.length > args['maxLength']

      broadcast :ok, invalid ? [I18n.t('validations.max_character', max: args['maxLength'])] : nil
    end
  end
end
