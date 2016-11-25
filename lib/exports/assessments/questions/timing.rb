module Exports
  module Assessments
    module Questions
      class Timing
        FIELDS = %w(firstClick lastClick pageSubmit clickCount).freeze

        # Parse RESULT data for XLSX
        def self.result(answers, _question)
          FIELDS.map { |field| answers.try(:[], field) unless answers.blank? }
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          FIELDS.map { |field| parsed_header << "QID#{question.id}_#{field}" }
          parsed_header
        end
      end
    end
  end
end
