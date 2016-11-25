module Exports
  module Assessments
    module Questions
      class GraphicSlider
        def self.result(answers, _question)
          (answers || []).map { |answer| answer['value'] }.join('')
        end

        def self.header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
