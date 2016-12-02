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
        def self.result(answers, _question)
          (answers || []).map { |answer| answer['index'] + 1 }.join(',')
        end

        def self.header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
