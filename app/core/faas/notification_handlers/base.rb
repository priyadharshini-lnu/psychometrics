# frozen_string_literal: true

module Faas
  module NotificationHandlers
    class Base < BaseCommand
      private_attr_reader :data

      def initialize(data)
        @data = data
      end
    end
  end
end
