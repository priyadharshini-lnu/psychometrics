# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class CampaignFactorFeedback
        include ImportExportConst

        def self.build_answers(data, question, duration, _use_scoring = false, _assign, **) # rubocop:disable Metrics/ParameterLists
          return nil if data.compact.blank?

          answers = []
          data.each_slice(2) do |factor|
            next if factor[0].blank? || factor[1].blank?

            answers << { code: factor[0], value: factor[1] }
          end

          {
            answers: answers,
            question_id: question.id,
            duration: duration
          }
        end
      end
    end
  end
end
