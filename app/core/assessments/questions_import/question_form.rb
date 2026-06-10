# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class QuestionForm < Base
      mimic :questions_import_question_form

      attribute :name, String
      attribute :type, String

      ALLOWED_QUESTION_TYPES = %w[TextEntry MultipleChoice MatrixTable StaticContent AudioResponse VideoResponse
                                  PageBreak].freeze

      validates :name, presence: true, unless: -> { type == 'PageBreak' }
      validates :type, presence: true
      validates :type, inclusion: { in: ALLOWED_QUESTION_TYPES }

      def default_values
        {
          skip_logic: [],
          validation: { 'type' => 'None', 'args' => {} }
        }
      end
    end
  end
end
