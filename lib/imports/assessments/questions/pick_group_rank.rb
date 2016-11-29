module Imports
  module Assessments
    module Questions
      class PickGroupRank
        # FROM:
        #      G1         G2      Groups items rank
        #   ['1,2,3',   '4,5',   1, 2, 3,   4,5]
        # TO:
        #   [{
        #     "scale": 0,  - Group ID
        #     "value": 0,  - Rank in Group
        #     "choice": 0  - Item ID
        #   }, ...]
        def self.build_answers(data, question)
          return nil if data.compact.blank?
          answers = []
          # Shift only group data column (Example: ['1,2,3', '4,5'])
          groups = data.shift(question.props['scalePoints'].to_i)
          groups.each_with_index do |choices, scale|
            choices.to_s.split(',').each_with_index do |choice, value|
              answers << {
                scale: scale,
                value: value,
                choice: choice.to_i - 1
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
