module Imports
  module Assessments
    module Questions
      class GraphicSlider
        # FROM:
        #   [5]
        # TO:
        #   [{"value": 5}]
        def self.build_answers(data, question, _use_scoring = false)
          return nil if data.compact.blank?
          {
            answers: [{
              value: data[0]
            }],
            question_id: question.id
          }
        end
      end
    end
  end
end
