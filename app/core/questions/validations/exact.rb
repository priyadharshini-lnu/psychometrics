# frozen_string_literal: true

module Questions::Validations
  class Exact < BaseCommand
    attr_accessor :args, :message, :value

    def initialize(validation, value, locale)
      @args = validation['args']
      @value = value || []
      @locale = locale
    end

    def call
      return broadcast :ok, nil unless args['exactValue']

      invalid = value.length > args['exactValue']

      broadcast :ok, invalid ? [I18n.t('validations.exact', count: args['exactValue'])] : nil
    end
  end
end
