# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MultipleChoice < Base
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": true
        #   }, ...]
        # TO:
        #   [1]
        def self.result(answers, question, scoring = false, export_with_labels = false)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          (answers || []).map do |answer|
            next factors_scoring[answer['index']] if scoring

            next answer['index'] + 1 unless export_with_labels

            question.props.dig('choicesTexts', answer['index'])
          end.join(',')
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
