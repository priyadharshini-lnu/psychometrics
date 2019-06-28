module Imports
  module Assessments
    module Questions
      class RankOrder
        # FROM:
        #   [1, ...]
        # TO:
        #   [{
        #     "index": 0,
        #     "value": 0
        #   }, ...]
        def self.build_answers(data, question, _use_scoring = false)
          return nil if data.compact.blank?
          answers = []
          decrease = %w(TextBox).include?(question.props['type']) ? 0 : 1
          data.each_with_index do |value, index|
            answers << {
              index: index,
              value: value.is_a?(Numeric) ? value - decrease : ''
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
