# frozen_string_literal: true

module Questions::Validations
  module Custom
    class NotSelected < BaseCommand
      attr_accessor :arg, :value

      def initialize(condition, value)
        @arg = condition['answer']
        @value = value || []
      end

      def call
        broadcast :ok, value.exclude?(arg)
      end
    end
  end
end
