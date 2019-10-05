# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MultipleChoice
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": true
        #   }, ...]
        # TO:
        #   [1]
        def self.result(answers, question, scoring = false)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          (answers || []).map { |answer| scoring && factors_scoring[answer['index']] || (answer['index'] + 1) }.
            join(',')
        end

        def self.result_label(answers, question)
          answers = (answers || []).map { |answer| question.props.dig('choicesTexts', answer['index']) }.
                    join(',')
          [answers]
        end

        def self.header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
