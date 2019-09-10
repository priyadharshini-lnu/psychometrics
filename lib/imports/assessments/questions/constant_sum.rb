# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class ConstantSum
        # FROM:
        #   [12, ...]
        # TO:
        #   [{
        #     "index": 0,
        #     "value": 12
        #   }, ...]
        def self.build_answers(data, question, _use_scoring = false)
          return nil if data.compact.blank?

          answers = []
          data.each_with_index do |value, index|
            answers << {
              index: index,
              value: value
            }
          end

          {
            answers: answers,
            question_id: question.id
          }
        end
      end
    end
  end
end
