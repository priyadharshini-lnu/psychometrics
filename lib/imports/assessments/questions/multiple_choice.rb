# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class MultipleChoice
        # FROM:
        #   ['1,2']
        # TO:
        #   [{
        #     "index": 0,
        #     "value": true
        #   }, ...]
        def self.build_answers(data, question, use_scoring = false)
          return nil if data.compact.blank?

          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['value']] = s['index']; }
          answers = []
          data.each do |values|
            values.to_s.split(',').each do |index|
              answers << {
                index: use_scoring && factors_scoring[index.to_i] || (index.to_i - 1),
                value: true
              }
            end
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
