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
        def self.result(answers, question)
          factors_scoring = question.detect_specified_scoring.
                            inject({}) { |sum, s| sum[s['index']] = s['value']; sum }
          (answers || []).map { |answer| factors_scoring[answer['index']] || (answer['index'] + 1) }.join(',')
        end

        def self.header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
