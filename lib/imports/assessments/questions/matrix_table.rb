# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class MatrixTable
        include ImportExportConst
        # Parse RESULT data for XLSX
        def self.build_answers(data, question, duration, use_scoring = false, _assign) # rubocop:disable Metrics/PerceivedComplexity
          return nil if data.compact.blank?

          answers = []
          not_applicable = {}
          if question.of_sub_type?('RankOrder', 'ConstantSum', 'TextEntry')
            answers = []
            index = 0
            question.props['choices'].to_i.times do |choice|
              question.props['scalePoints'].to_i.times do |scale|
                if not_applicable_data?(question, data[index])
                  index += 1
                  next not_applicable[choice.to_s] = true
                else
                  answers << {
                    scale: scale,
                    value: data[index],
                    choice: choice
                  }
                  index += 1
                end
              end
            end
          else
            # Create hash for scoring
            # hash['1-100'] = 2
            # Where 1 - choice, 2 - scale, 100 - scoring value
            factors_scoring = question.detect_specified_scoring.
                              each_with_object({}) { |s, sum| sum["#{s['choice']}-#{s['value']}"] = s['scale']; }
            data.each_with_index do |scales, choice|
              next not_applicable[choice.to_s] = true if not_applicable_data?(question, scales)

              scales.to_s.split(';').each do |scale|
                answers << {
                  scale: (use_scoring && factors_scoring["#{choice}-#{scale}"]) || (scale.to_i - 1),
                  value: true,
                  choice: choice
                }
              end
            end
          end

          {
            answers: answers,
            question_id: question.id,
            not_applicable: not_applicable,
            duration: duration
          }
        end

        def self.not_applicable_data?(question, value)
          [NOT_APPLICABLE_PLACEHOLDER, question.props['notApplicableLabel']].include?(value)
        end
      end
    end
  end
end
