# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class SideBySide < Base
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
        def self.result(answers, question, scoring = false)
          parsed_result = []
          # Create hash for scoring
          # hash['1-2-3'] = 100
          # Where 1 - choice, 2 - scale, 3 - value index, 100 - scoring value
          factors_scoring = {}
          question.detect_specified_scoring.each do |sc|
            key = "#{sc['choice']}-#{sc['scale']}"
            sc['values'].each do |value|
              factors_scoring["#{key}-#{value['index']}"] = value['value']
            end
          end
          question.props['scalePoints'].to_i.times do |scale|
            question.props['choices'].to_i.times do |choice|
              values = (answers || []).detect { |a| a['choice'] == choice && a['scale'] == scale }.try(:[], 'values')
              column_data = question.props['columnsData'][scale]
              parsed_result << '' && next unless values
              parsed_result << if column_data['type'] == 'Text'
                                 values.map { |value| value['value'] }
                               else
                                 values.map do |value|
                                   scoring &&
                                     factors_scoring["#{choice}-#{scale}-#{value['index'].to_i}"] ||
                                     value['index'].to_i + 1
                                 end .join(', ')
                               end
            end
          end
          Utility::Array.ensure_size(parsed_result, question_header_size(question))
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []

          question.props['scalePoints'].to_i.times do |scale|
            question.props['choices'].to_i.times do |choice|
              column_data = question.props.dig('columnsData', scale)
              choice_text = question.props.dig('choicesTexts', choice)
              scale_text = column_data['text']
              # byebug
              if column_data['type'] == 'Text'
                column_data['answers'].to_i.times do |column|
                  column_text = column_data['answersTexts']
                  question_id_header << "QID#{question.id}_#{scale + 1}_#{choice + 1}_#{column + 1}"
                  question_choices_header << "#{scale_text} | #{choice_text} | #{column_text}"
                end
              else
                question_id_header << "QID#{question.id}_#{scale + 1}_#{choice + 1}"
                question_choices_header << "#{scale_text} | #{choice_text}"
              end
            end
          end

          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end
