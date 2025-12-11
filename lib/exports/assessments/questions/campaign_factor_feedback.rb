# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class CampaignFactorFeedback < Base
        include ImportExportConst

        def self.result(user_result, question, export_with_labels: false, **_args)
          all_answers = []
          answers = get_answers(user_result, question) || []

          campaign_factors = load_campaign_factors(user_result, export_with_labels)

          question.props['maxFactors'].times do |i|
            process_answer(all_answers, answers[i], campaign_factors, export_with_labels)
          end

          all_answers << get_duration(user_result, question)
        end

        def self.question_id_header(question)
          fields = []
          question.props['maxFactors'].times do |i|
            fields.push("QID#{question.id}_campaign_factor_#{i + 1}",
                        "QID#{question.id}_campaign_factor_feedback_#{i + 1}")
          end

          [*fields, duration_header(question)]
        end

        def self.load_campaign_factors(user_result, export_with_labels)
          return [] unless export_with_labels

          user_result.user_assessment.assessment.campaign_factors_list || []
        end

        def self.process_answer(all_answers, answer, campaign_factors, export_with_labels)
          if answer.present?
            code = answer['code']
            value = answer['value']
            key = get_factor_key(code, campaign_factors, export_with_labels)
            all_answers.push(key, value)
          else
            all_answers.push('', '')
          end
        end

        def self.get_factor_key(code, campaign_factors, export_with_labels)
          return code unless export_with_labels

          factor = campaign_factors.find { |f| f['code'] == code }
          factor ? factor['name'] : code
        end
      end
    end
  end
end
