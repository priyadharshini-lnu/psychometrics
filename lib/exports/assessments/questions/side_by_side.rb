module Exports
  module Assessments
    module Questions
      class SideBySide
        # FROM:
        #   [{
        #     "scale": 0,
        #     "choice": 0,
        #     "values": [{
        #         "index": 0,
        #         "value": true / any value
        #     }, ...]
        #   }, ...]
        # TO:
        #     Scale
        #   [1, 2, 3,   4,'2,3',6,  ...]
        #   WHERE: Choices grouped by scale
        def self.result(answers, question)
          parsed_result = []
          question.props['scalePoints'].to_i.times do |scale|
            question.props['choices'].to_i.times do |choice|
              values = (answers || []).detect { |a| a['choice'] == choice && a['scale'] == scale }.try(:[], 'values')
              column_data = question.props['columnsData'][scale]
              parsed_result << '' && next unless values
              parsed_result << if column_data['type'] == 'Text'
                                 values.map { |value| value['value'] }
                               else
                                 values.map { |value| value['index'].to_i + 1 }.join(', ')
                               end
            end
          end
          parsed_result
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          question.props['scalePoints'].to_i.times do |scale|
            question.props['choices'].to_i.times do |choice|
              column_data = question.props['columnsData'][scale]
              if column_data['type'] == 'Text'
                column_data['answers'].to_i.times do |column|
                  parsed_header << "QID#{question.id}_#{scale + 1}_#{choice + 1}_#{column + 1}"
                end
              else
                parsed_header << "QID#{question.id}_#{scale + 1}_#{choice + 1}"
              end
            end
          end
          parsed_header
        end
      end
    end
  end
end
