# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class Timing
        def self.build_answers(values, question, duration, _use_scoring = false, _assign, **) # rubocop:disable Metrics/ParameterLists
          return nil if values.compact.blank?

          {
            answers: ::Exports::Assessments::Questions::Timing::FIELDS.zip(values).to_h,
            question_id: question.id,
            duration: duration
          }
        end
      end
    end
  end
end
