# frozen_string_literal: true

module UsersResults
  module ExpandAnswersByRecodingTypes
    class BaseType < BaseCommand
      def initialize(answers, question_recoding)
        @answers = answers
        @question_recoding = question_recoding
      end

      protected

      attr_reader :answers, :question_recoding
    end
  end
end
