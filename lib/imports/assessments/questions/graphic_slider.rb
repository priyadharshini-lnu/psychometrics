# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class GraphicSlider
        # FROM:
        #   [5]
        # TO:
        #   [{"value": 5}]
        def self.build_answers(data, question, duration, _use_scoring = false, _assign, **) # rubocop:disable Metrics/ParameterLists
          return nil if data.compact.blank?

          {
            answers: [{
              value: data[0]
            }],
            question_id: question.id,
            duration: duration
          }
        end
      end
    end
  end
end
