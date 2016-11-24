module Exports
  module Assessments
    module Questions
      class MatrixTable
        # Parse RESULT data for XLSX
        def self.result(answers, question)
          parsed_result = []
          # IF: answer can contain any data (string, number and etc.)
          # THEN: we collect results for each choiceID and scaleID
          # =>    example: [1,2,3,4]
          # ELSE: we collect results grouped by choiceID and joined ','
          # =>    example: ['1,2', '3,4']
          if %w(RankOrder ConstantSum TextEntry).include?(question.props['type'])
            question.props['choices'].to_i.times do |c|
              question.props['scalePoints'].to_i.times do |s|
                parsed_result << answers.detect { |a| a['choice'] == c && a['scale'] == s }.try(:[], 'value')
              end
            end
          else
            question.props['choices'].to_i.times do |c|
              parsed_result << answers.select { |a| a['choice'] == c }.map { |a| a['scale'] + 1 }.join(',')
            end
          end
          parsed_result
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          # IF: answer can contain any data (string, number and etc.)
          # THEN: we collect header for each choiceID and scaleID
          # =>    example: [QID_1_1, QID_2_1, QID_3_1]
          # ELSE: we collect results grouped by choiceID
          # =>    example: [QID_1, QID_2, QID_3]
          if %w(RankOrder ConstantSum TextEntry).include?(question.props['type'])
            question.props['choices'].to_i.times do |c|
              question.props['scalePoints'].to_i.times do |s|
                parsed_header << "QID#{question.id}_#{c + 1}_#{s + 1}"
              end
            end
          else
            question.props['choices'].to_i.times do |c|
              parsed_header << "QID#{question.id}_#{c + 1}"
            end
          end
          parsed_header
        end
      end
    end
  end
end
