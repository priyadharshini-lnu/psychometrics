# frozen_string_literal: true

module Threesixty
  module Reports
    class IsAvailable < BaseCommand
      def initialize(subject)
        @subject = subject
      end

      def call; end
    end
  end
end
