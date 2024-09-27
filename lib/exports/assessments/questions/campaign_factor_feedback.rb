# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class CampaignFactorFeedback < Base
        include ImportExportConst

        def self.result(user_result, question, _scoring = false, _export_with_labels = false)
          all_answers = []
          answers = get_answers(user_result, question) || []

          question.props['maxFactors'].times do |i|
            answer = answers[i]
            if answer
              all_answers.concat([answer['code'], answer['value']])
            else
              all_answers.concat(['', ''])
            end
          end

          all_answers << get_duration(user_result, question)
        end

        def self.question_id_header(question)
          fields = []
          question.props['maxFactors'].times do |i|
            fields.concat(["QID#{question.id}_campaign_factor_code_#{i + 1}",
                           "QID#{question.id}_campaign_factor_feedback_#{i + 1}"])
          end

          [*fields, duration_header(question)]
        end
      end
    end
  end
end
