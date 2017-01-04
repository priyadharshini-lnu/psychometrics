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
            # Create hash for scoring
            # hash['1-100'] = 2
            # Where 1 - choice, 2 - scale, 100 - scoring value
            factors_scoring = question.detect_specified_scoring.
                              inject({}) { |sum, s| sum["#{s['choice']}-#{s['value']}"] = s['scale']; sum }
            data.each_with_index do |scales, choice|
              scales.to_s.split(',').each do |scale|
                answers << {
                  scale: factors_scoring["#{choice}-#{scale}"] || scale.to_i - 1,
                  value: true,
                  choice: choice
                }
              end
            end
          end

          {
            answers: answers,
            question_id: question.id
          }
        end
      end
    end
  end
end
