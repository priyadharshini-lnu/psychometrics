# frozen_string_literal: true

module Questions::Validations
  module Custom
    class DoesNotContains < BaseCommand
      attr_accessor :arg, :value

      def initialize(condition, value)
        @arg = condition['value']
        @value = value
      end

      def call
        broadcast :ok, value.exclude?(arg)
      end
    end
  end
end
