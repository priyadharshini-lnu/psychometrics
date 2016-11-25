module Exports
  module Assessments
    module Questions
      class GapAnalysis
        def self.result(answers, _question)
          (answers || []).map { |answer| answer['scale'] + 1 }
        end

        def self.header(question)
          parsed_header = []
          question.props['choices'].to_i.times do |c|
            parsed_header << "QID#{question.id}_#{c + 1}"
          end
          parsed_header
        end
      end
    end
  end
end
