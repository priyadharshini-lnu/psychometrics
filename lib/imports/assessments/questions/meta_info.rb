# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class MetaInfo
        def self.build_answers(values, question, _duration, _use_scoring = false, _assign, **) # rubocop:disable Metrics/ParameterLists
          return nil if values.compact.blank?

          {
            answers: ::Exports::Assessments::Questions::MetaInfo::FIELDS.zip(values).to_h,
            question_id: question.id
          }
        end
      end
    end
  end
end
