module Imports
  module Assessments
    module Questions
      class TextEntry
        # FROM:
        #   ['Value']
        # TO:
        #   [{
        #     "index": 0,
        #     "value": 'Value'
        #   }, ...]
        def self.build_answers(data, question, use_scoring = false)
          factors_scoring = question.detect_specified_scoring.
                            inject({}) { |sum, s| sum[s['value']] = s['index']; sum }
          return nil if data.compact.blank?
          answers = []
          data.each_with_index do |value, index|
            answers << {
              index: index,
              value: use_scoring && factors_scoring[value] || value
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
