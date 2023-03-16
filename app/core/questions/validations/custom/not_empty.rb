# frozen_string_literal: true

module Questions::Validations
  module Custom
    class NotEmpty < BaseCommand
      attr_accessor :value

      def initialize(_, value)
        @value = value
      end

      def call
        broadcast :ok, value.present?
      end
    end
  end
end
