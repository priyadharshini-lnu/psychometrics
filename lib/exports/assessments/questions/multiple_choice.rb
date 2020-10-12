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
        def self.result(user_result, question, scoring = false, export_with_labels = false)
          answers = get_answers(user_result, question)
          not_applicable = get_not_applicable(user_result, question)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          if answers.present?
            (answers || []).map do |answer|
              next factors_scoring[answer['index']] if scoring

              next answer['index'] + 1 unless export_with_labels

              question.props.dig('choicesTexts', answer['index'])
            end.join(',')
          elsif not_applicable
            export_with_labels ? question.props['notApplicableLabel'] : NOT_APPLICABLE_PLACEHOLDER
          end
        end

        def self.result_label(answers, question)
          answers = (answers || []).map { |answer| question.props.dig('choicesTexts', answer['index']) }.
                    join(',')
          [answers]
        end

        def self.question_id_header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
