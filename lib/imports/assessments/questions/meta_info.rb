# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class MetaInfo
        def self.build_answers(values, question, _use_scoring = false)
          return nil if values.compact.blank?

          {
            answers: Hash[::Exports::Assessments::Questions::MetaInfo::FIELDS.zip(values)],
            question_id: question.id
          }
        end
      end
    end
  end
end
