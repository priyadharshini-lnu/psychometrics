# frozen_string_literal: true

module Questions::Validations
  module Custom
    class GreaterThanOrEqual < BaseCommand
      attr_accessor :arg, :value

      def initialize(condition, value)
        @arg = condition['value']
        @value = value
      end

      def call
        broadcast :ok, value.to_i >= arg.to_i
      end
    end
  end
end
