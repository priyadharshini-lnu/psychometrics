module Imports
  module Assessments
    module Questions
      class HotSpot
        VALUES = {
          'Like' => true,
          'On' => true,
          'Dislike' => false,
          'Neutral' => nil,
          'Off' => nil
        }.freeze

        # FROM:
        #   ['Like or On/Dislike/Neutral or Off']
        #   WHERE: index of array it's region ID
        # TO
        #   [{
        #     "value": true/false/null,
        #     "region": 0
        #   }]
        def self.build_answers(data, question)
          return nil if data.compact.blank?
          answers = []
          data.each_with_index do |value, region|
            answers << {
              value: value && VALUES[value],
              region: region
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
