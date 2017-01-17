module Exports
  module Assessments
    module Questions
      class Timing
        FIELDS = %w(firstClick lastClick pageSubmit clickCount).freeze

        # Parse RESULT data for XLSX
        def self.result(answers, _question, _scoring = false)
          FIELDS.map { |field| answers.try(:[], field) unless answers.blank? }
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          FIELDS.map { |field| "QID#{question.id}_#{field}" }
        end
      end
    end
  end
end
