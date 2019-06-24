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
        def self.build_answers(data, question, use_scoring = false)
          return nil if data.compact.blank?
          factors_scoring = question.detect_specified_scoring.
                            inject({}) { |sum, s| sum[s['index']] = s['value']; sum }
          answers = []
          data.each_with_index do |value, index|
            answers << {
              index: index,
              value: value.is_a?(Numeric) ? (value / (use_scoring && factors_scoring[index] || 1)) : ''
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
