module Imports
  module Assessments
    module Questions
      class Timing
        def self.build_answers(values, question)
          return nil if values.compact.blank?
          {
            answers: Hash[::Exports::Assessments::Questions::Timing::FIELDS.zip(values)],
            question_id: question.id
          }
        end
      end
    end
  end
end
