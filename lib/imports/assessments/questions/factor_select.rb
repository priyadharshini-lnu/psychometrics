# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class FactorSelect
        include ImportExportConst

        # FROM:
        #   ['1, 2']
        # TO:
        #   [{
        #     "index": 0,
        #     "value": true
        #   }, ...]
        def self.build_answers(data, question, duration, _use_scoring = false, _assign, **) # rubocop:disable Metrics/ParameterLists
          return nil if data.compact.blank?

          {
            answers: data.first.split(';').map(&:to_i),
            question_id: question.id,
            duration: duration
          }
        end
      end
    end
  end
end
