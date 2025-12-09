# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class MatrixTable < Base
        include ImportExportConst

        # Parse RESULT data for XLSX
        def self.result(user_result, question, scoring: false, export_with_labels: false, concat_answers: true)
          # IF: answer can contain any data (string, number and etc.)
          # THEN: we collect results for each choiceID and scaleID
          # =>    example: [1,2,3,4]
          # ELSE: we collect results grouped by choiceID and joined ','
          # =>    example: ['1,2', '3,4']
          not_applicable = get_not_applicable(user_result, question)
          answers = get_answers(user_result, question)
          parsed_result = if question.of_sub_type?('RankOrder', 'ConstantSum', 'TextEntry')
                            multi_scale_answers(answers, question, export_with_labels, not_applicable)
                          else
                            single_scale_answers(answers, question, scoring, export_with_labels, not_applicable,
                                                 concat_answers)
                          end
          parsed_result << get_duration(user_result, question)
          Utility::Array.ensure_size(parsed_result, question_header_size(question))
        end

        def self.single_scale_answers(answers, question, scoring, export_with_labels, not_applicable, # rubocop:disable Metrics/ParameterLists
                                      concat_answers)
          # Create hash for scoring
          # hash['1-2'] = 100
          # Where 1 - choice, 2 - scale, 100 - scoring value
          parsed_result = []
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum["#{s['choice']}-#{s['scale']}"] = s['value'] }

          question.props['choices'].to_i.times do |choice|
            result = (answers || []).
                     select { |a| a['choice'] == choice && a['value'] == true }.
                     map do |a|
                       next factors_scoring["#{a['choice']}-#{a['scale']}"] if scoring

                       next a['scale'] + 1 unless export_with_labels

                       question.props.dig('scalePointsTexts', a['scale'])
                     end
            parsed_result << (concat_answers ? result.join(';') : result)
          end
          add_not_applicable_result(parsed_result, export_with_labels, question, not_applicable)
        end

        def self.multi_scale_answers(answers, question, export_with_labels, not_applicable)
          parsed_result = []
          question.props['choices'].to_i.times do |choice|
            question.props['scalePoints'].to_i.times do |scale|
              parsed_result << if not_applicable && not_applicable[choice.to_s] == true
                                 export_with_labels ? question.props['notApplicableLabel'] : NOT_APPLICABLE_PLACEHOLDER
                               else
                                 (answers || []).detect { |a| a['choice'] == choice && a['scale'] == scale }.
                               try(:[], 'value')
                               end
            end
          end
          parsed_result
        end

        def self.add_not_applicable_result(parsed_result, export_with_labels, question, not_applicable)
          return parsed_result unless not_applicable

          not_applicable.each do |key, value|
            next unless value

            parsed_result[key.to_i] = if export_with_labels
                                        question.props['notApplicableLabel']
                                      else
                                        NOT_APPLICABLE_PLACEHOLDER
                                      end
          end
          parsed_result
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          if question.of_sub_type?('RankOrder', 'ConstantSum', 'TextEntry')
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
          append_duration_header(question, question_id_header, question_choices_header)
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end
