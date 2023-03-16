# frozen_string_literal: true

module Questions::Validations
  module Custom
    class Selected < BaseCommand
      attr_accessor :arg, :value

      def initialize(condition, value)
        @arg = condition['answer']
        @value = value || []
      end

      def call
        broadcast :ok, value.include?(arg)
      end
    end
  end
end
