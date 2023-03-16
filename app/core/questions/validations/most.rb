# frozen_string_literal: true

module Questions::Validations
  class Most < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || []
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['maxValue']

      invalid = value.length > args['maxValue']

      broadcast :ok, invalid ? [I18n.t('validations.most', max: args['maxValue'])] : nil
    end
  end
end
