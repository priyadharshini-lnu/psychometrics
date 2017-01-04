module Imports
  module Assessments
    module Questions
      class SideBySide
        # FROM:
        #     Scale
        #   [1, 2, 3,   4,'2,3',6,  ...]
        #   WHERE: Choices grouped by scale
        # TO:
        #   [{
        #     "scale": 0,
        #     "choice": 0,
        #     "values": [{
        #         "index": 0,
        #         "value": true / any value
        #     }, ...]
        #   }, ...]
        def self.build_answers(data, question)
          return nil if data.compact.blank?
          answers = []
          index = 0
          # Build factors scoring
          factors_scoring = {}
          question.detect_specified_scoring.each do |scoring|
            key = "#{scoring['choice']}-#{scoring['scale']}"
            scoring['values'].each do |value|
              factors_scoring["#{key}-#{value['value']}"] = value['index']
            end
          end

          question.props['scalePoints'].to_i.times do |scale|
            question.props['choices'].to_i.times do |choice|
              column_data = question.props['columnsData'][scale]
              values = if column_data['type'] == 'Text'
                         Array.new(column_data['answers'].to_i) do |i|
                           index += i
                           {
                             index: i,
                             value: data[index].to_s
                           }
                         end
                       else
                         data[index].to_s.split(',').map do |i|
                           {
                             index: factors_scoring["#{choice}-#{scale}-#{i}"] || (i.to_i - 1),
                             value: true
                           }
                         end
                       end
              answers << {
                scale: scale,
                choice: choice,
                values: values
              }
              index += 1
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
