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
        def self.build_answers(data, question)
          return nil if data.compact.blank?
          answers = []
          data.each do |values|
            values.to_s.split(',').each do |index|
              answers << {
                index: index.to_i - 1,
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
