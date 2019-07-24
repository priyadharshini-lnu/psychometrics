# frozen_string_literal: true

module Threesixty
  module Emails
    class Base < BaseCommand
      private_attr_reader :context

      def initialize(context)
        @context = context
      end
    end
  end
end
