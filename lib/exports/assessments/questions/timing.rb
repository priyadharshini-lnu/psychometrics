# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class Timing < Base
        include ImportExportConst

        FIELDS = %w[firstClick lastClick pageSubmit clickCount].freeze

        # Parse RESULT data for XLSX
        def self.result(user_result, question, **_args)
          answers = get_answers(user_result, question)
          all_answers = FIELDS.map { |field| answers.try(:[], field.underscore) if answers.present? }
          all_answers << get_duration(user_result, question)
        end

        # Parse HEADER data for XLSX
        def self.question_id_header(question)
          headers = FIELDS.map { |field| "QID#{question.id}_#{field}" }
          headers << duration_header(question)
        end
      end
    end
  end
end
