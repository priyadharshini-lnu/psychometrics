# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MetaInfo < Base
        FIELDS = %w[browser version os screen java flash userAgent].freeze

        # Parse RESULT data for XLSX
        def self.result(user_result, question, **_args)
          answers = get_answers(user_result, question)
          answers = if answers.blank?
                      Array.new(FIELDS.size) { '' }
                    else
                      FIELDS.map { |field| answers.try(:[], field) }
                    end
          answers << get_duration(user_result, question)
        end

        # Parse HEADER data for XLSX
        def self.question_id_header(question)
          parsed_header = []
          FIELDS.map { |field| parsed_header << "QID#{question.id}_#{field}" }
          parsed_header << duration_header(question)
        end
      end
    end
  end
end
