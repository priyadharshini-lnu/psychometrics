# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MatrixTable < Base
        # Parse RESULT data for XLSX
        def self.result(answers, question, scoring = false, export_with_labels = false)
          parsed_result = []
          # IF: answer can contain any data (string, number and etc.)
          # THEN: we collect results for each choiceID and scaleID
          # =>    example: [1,2,3,4]
          # ELSE: we collect results grouped by choiceID and joined ','
          # =>    example: ['1,2', '3,4']
          if %w[RankOrder ConstantSum TextEntry].include?(question.props['type'])
            question.props['choices'].to_i.times do |choice|
              question.props['scalePoints'].to_i.times do |scale|
                parsed_result << (answers || []).detect { |a| a['choice'] == choice && a['scale'] == scale }.
                                 try(:[], 'value')
              end
            end
          else
            # Create hash for scoring
            # hash['1-2'] = 100
            # Where 1 - choice, 2 - scale, 100 - scoring value
            factors_scoring = question.detect_specified_scoring.
                              each_with_object({}) { |s, sum| sum["#{s['choice']}-#{s['scale']}"] = s['value']; }

            question.props['choices'].to_i.times do |choice|
              parsed_result << (answers || []).
                               select { |a| a['choice'] == choice && a['value'] == true }.
                               map do |a|
                                 next factors_scoring["#{a['choice']}-#{a['scale']}"] if scoring

                                 next a['scale'] + 1 unless export_with_labels

                                 question.props.dig('scalePointsTexts', a['scale'])
                               end.join(',')
            end
          end
          Utility::Array.ensure_size(parsed_result, question_header_size(question))
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          if %w[RankOrder ConstantSum TextEntry].include?(question.props['type'])
            question.props['choices'].to_i.times do |c|
              question.props['scalePoints'].to_i.times do |s|
                question_id_header << "QID#{question.id}_#{c + 1}_#{s + 1}"
                question_choices_header << "#{question.props.dig('choicesTexts', c)} |
                  #{question.props.dig('scalePointsTexts', c)}"
              end
            end
          else
            question.props['choices'].to_i.times do |c|
              question_id_header << "QID#{question.id}_#{c + 1}"
              question_choices_header << question.props.dig('choicesTexts', c)
            end
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end
