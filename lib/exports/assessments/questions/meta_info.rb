# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MetaInfo < Base
        FIELDS = %w[browser version os screen java flash userAgent].freeze

        # Parse RESULT data for XLSX
        def self.result(user_result, question, _scoring = false, _export_with_labels = false)
          answers = get_answers(user_result, question)
          FIELDS.map { |field| answers.try(:[], field) unless answers.blank? }
        end

        # Parse HEADER data for XLSX
        def self.question_id_header(question)
          parsed_header = []
          FIELDS.map { |field| parsed_header << "QID#{question.id}_#{field}" }
          parsed_header
        end
      end
    end
  end
end
