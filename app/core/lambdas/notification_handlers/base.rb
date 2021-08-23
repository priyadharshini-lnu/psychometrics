# frozen_string_literal: true

module Lambdas
  module NotificationHandlers
    class Base < BaseCommand
      private_attr_reader :data

      def initialize(data)
        @data = data
      end
    end
  end
end
