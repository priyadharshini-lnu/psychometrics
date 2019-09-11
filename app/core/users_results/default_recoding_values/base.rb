# frozen_string_literal: true

module UsersResults
  module DefaultRecodingValues
    class Base < BaseCommand
      def initialize(question)
        @question = question
      end

      def call
        broadcast :ok, perform
      end

      protected

      attr_reader :question
    end
  end
end
