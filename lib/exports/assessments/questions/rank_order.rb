module Exports
  module Assessments
    module Questions
      class RankOrder
        # Parse RESULT data for XLSX
        def self.result(answers, question)
          increase = %w(TextBox).include?(question.props['type']) ? 0 : 1
          (answers || []).sort_by { |a| a['index'] }.map { |a| a['value'] + increase }
        end

        # Parse HEADER data for XLSX
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
