# frozen_string_literal: true

module Questions::Validations
  module Custom
    class Empty < BaseCommand
      attr_accessor :value

      def initialize(_, value)
        @value = value
      end

      def call
        broadcast :ok, value.blank?
      end
    end
  end
end
