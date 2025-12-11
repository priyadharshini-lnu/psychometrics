# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MultipleChoice < Base
        include ImportExportConst

        # FROM:
        #   [{
        #     "index": 0,
        #     "value": true
        #   }, ...]
        # TO:
        #   [1]
        def self.result(user_result, question, scoring: false, export_with_labels: false, concat_answers: true)
          all_answers = []
          not_applicable = get_not_applicable(user_result, question)
          answers = get_answers(user_result, question)
          all_answers << if answers.present?
                           retrive_answers(answers, question, scoring: scoring, export_with_labels: export_with_labels,
concat_answers: concat_answers)
                         elsif not_applicable
                           (export_with_labels ? question.props['notApplicableLabel'] : NOT_APPLICABLE_PLACEHOLDER)
                         else
                           ''
                         end
          all_answers << get_duration(user_result, question)
        end

        def self.result_label(answers, question)
          answers = (answers || []).map { |answer| question.props.dig('choicesTexts', answer['index']) }.
                    join(',')
          [answers]
        end

        def self.retrive_answers(answers, question, scoring:, export_with_labels:, concat_answers: true)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value'] }

          result = (answers || []).map do |answer|
            next factors_scoring[answer['index']] if scoring

            next answer['index'] + 1 unless export_with_labels

            question.props.dig('choicesTexts', answer['index'])
          end
          concat_answers ? result.join(';') : result
        end

        def self.question_id_header(question)
          ["QID#{question.id}", duration_header(question)]
        end
      end
    end
  end
end
