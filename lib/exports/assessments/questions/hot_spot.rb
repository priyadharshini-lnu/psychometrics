module Exports
  module Assessments
    module Questions
      class HotSpot
        # Parse RESULT data for XLSX
        def self.result(answers, _question)
          ['']
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          ['']
          # parsed_header = []
          # question.props['choices'].to_i.times do |c|
          #   parsed_header << "QID#{question.id}_#{c + 1}"
          # end
          # parsed_header
        end
      end
    end
  end
end
