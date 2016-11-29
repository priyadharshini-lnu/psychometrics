module Imports
  module Assessments
    module Questions
      class MatrixTable
        # Parse RESULT data for XLSX
        def self.build_answers(data, question)
          return nil if data.compact.blank?
          answers = []
          if %w(RankOrder ConstantSum TextEntry).include?(question.props['type'])
            answers = []
            index = 0
            question.props['choices'].to_i.times do |choice|
              question.props['scalePoints'].to_i.times do |scale|
                answers << {
                  scale: scale,
                  value: data[index],
                  choice: choice
                }
                index += 1
              end
            end
          else
            data.each_with_index do |scales, choice|
              scales.to_s.split(',').each do |scale|
                answers << {
                  scale: scale.to_i - 1,
                  value: true,
                  choice: choice
                }
              end
            end
          end
          answers
        end
      end
    end
  end
end
