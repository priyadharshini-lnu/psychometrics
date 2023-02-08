# frozen_string_literal: true

module Questions::Validations::Custom
  class EqualTo < BaseCommand
    attr_accessor :arg, :value

    def initialize(condition, value)
      @arg = condition['value']
      @value = value
    end

    def call
      broadcast :ok, arg == value
    end
  end
end
