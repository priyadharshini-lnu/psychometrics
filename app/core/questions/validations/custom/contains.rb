# frozen_string_literal: true

module Questions::Validations
  module Custom
    class Contains < BaseCommand
      attr_accessor :arg, :value

      def initialize(condition, value)
        @arg = condition['value']
        @value = value
      end

      def call
        broadcast :ok, value.include?(arg)
      end
    end
  end
end
