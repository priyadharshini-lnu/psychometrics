# frozen_string_literal: true

module Questions::Validations
  class WordsRange < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || ''
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['minLength'] && args['maxLength']

      arr = value.split(/\s+/)
      invalid = arr.size < args['minLength'] || arr.size > args['maxLength']

      broadcast :ok, invalid && [I18n.t('validations.word_range', min: args['minLength'], max: args['maxLength'])]
    end
  end
end
