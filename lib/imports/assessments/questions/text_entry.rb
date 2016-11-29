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
        def self.build_answers(data, question)
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
