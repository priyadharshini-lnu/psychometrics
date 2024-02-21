# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class QuestionForm < Base
      mimic :questions_import_question_form

      attribute :name, String
      attribute :type, String

      validates :name, presence: true, unless: -> { type == 'PageBreak' }
      validates :type, presence: true
      validates :type, inclusion: { in: %w[TextEntry MultipleChoice MatrixTable StaticContent PageBreak] }

      def default_values
        {
          skip_logic: [],
          validation: { 'type' => 'None', 'args' => {} }
        }
      end
    end
  end
end
