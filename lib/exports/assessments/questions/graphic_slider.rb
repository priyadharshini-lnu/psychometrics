module Exports
  module Assessments
    module Questions
      class GraphicSlider
        # FROM:
        #   [{"value": 5}]
        # TO:
        #   [5]
        def self.result(answers, _question, _scoring = false)
          answers = (answers || []).map { |answer| answer['value'] }
          required_size = header(question).size
          Utility::Array.ensure_size(answers, required_size)
        end

        def self.header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
