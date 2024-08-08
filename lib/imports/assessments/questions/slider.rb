# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class Slider
        # FROM:
        #   [12, ...]
        # TO:
        #   [{
        #     "index": 0,
        #     "value": 12
        #   }, ...]
        def self.build_answers(data, question, duration, use_scoring = false, _assign)
          return nil if data.compact.blank?

          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          answers = []
          not_applicable = {}
          na_label = question.props['notApplicableLabel'] || NOT_APPLICABLE_PLACEHOLDER

          data.each_with_index do |value, index|
            if value == na_label
              not_applicable[index.to_s] = true
              next
            end
            answers << {
              index: index,
              value: value.is_a?(Numeric) ? (value / ((use_scoring && factors_scoring[index]) || 1)) : ''
            }
          end

          {
            answers: answers,
            not_applicable: not_applicable,
            question_id: question.id,
            duration: duration
          }
        end
      end
    end
  end
end
