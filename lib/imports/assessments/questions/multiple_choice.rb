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
                            inject({}) { |sum, s| sum[s['value']] = s['index']; sum }
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
