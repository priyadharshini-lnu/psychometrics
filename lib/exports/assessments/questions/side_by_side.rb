module Exports
  module Assessments
    module Questions
      class SideBySide
        # Parse RESULT data for XLSX
        def self.result(answers, question)
          parsed_result = []
          question.props['scalePoints'].to_i.times do |s|
            question.props['choices'].to_i.times do |c|
              values = (answers || []).detect { |a| a['choice'] == c && a['scale'] == s }.try(:[], 'values')
              column_data = question.props['columnsData'][s]
              if column_data['type'] == 'Text'
                parsed_result << values.map { |value| value['value'] } if values
              else
                parsed_result << values.map { |value| value['index'].to_i + 1 }.join(', ') if values
              end
            end
          end
          parsed_result
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          question.props['scalePoints'].to_i.times do |s|
            question.props['choices'].to_i.times do |c|
              column_data = question.props['columnsData'][s]
              if column_data['type'] == 'Text'
                column_data['answers'].to_i.times do |col|
                  parsed_header << "QID#{question.id}_#{s + 1}_#{c + 1}_#{col + 1}"
                end
              else
                parsed_header << "QID#{question.id}_#{s + 1}_#{c + 1}"
              end
            end
          end
          parsed_header
        end
      end
    end
  end
end
