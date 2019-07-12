# frozen_string_literal: true

module Threesixty
  module Emails
    class Base < BaseCommand
      def initialize(context)
        @context = context
      end

      private

      attr_reader :context
    end
  end
end
