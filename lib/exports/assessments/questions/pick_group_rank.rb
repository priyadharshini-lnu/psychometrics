# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class PickGroupRank < Base
        # FROM:
        #   [{
        #     "scale": 0,  - Group ID
        #     "value": 0,  - Rank in Group
        #     "choice": 0  - Item ID
        #   }, ...]
        # TO:
        #      G1         G2      Groups items rank
        #   ['1,2,3',   '4,5',   1, 2, 3,   4,5]
        def self.result(answers, question, scoring = false)
          parsed_result = []

          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }

          question.props['scalePoints'].to_i.times do |s|
            parsed_result << (answers || []).
                             select { |answer| answer['scale'] == s }.
                             sort_by { |answer| answer['value'] }.
                             map { |answer| scoring && factors_scoring[answer['choice']] || (answer['choice'] + 1) }.
                             join(', ')
          end
          question.props['scalePoints'].to_i.times do |s|
            question.props['choices'].to_i.times do |c|
              parsed_result << (answers || []).
                               select { |answer| answer['scale'] == s && answer['choice'] == c }.
                               map { |a| a['value'] + 1 }.
                               join(', ')
            end
          end
          required_size = header(question).size
          Utility::Array.ensure_size(parsed_result, required_size)
        end

        def self.headers_by_choices(question)
          question_id_header = []
          question_choices_header = []

          question.props['scalePoints'].to_i.times do |s|
            question_id_header << "QID#{question.id}_#{s + 1}_GROUP"
            question_id_header << question.props.dig('scalePointsTexts', s)
          end

          question.props['scalePoints'].to_i.times do |s|
            question.props['choices'].to_i.times do |c|
              parsed_header << "QID#{question.id}_#{s + 1}_#{c + 1}_RANK"
              question_id_header << "#{question.props.dig('scalePointsTexts', c)} |
                #{question.props.dig('choicesTexts', c)}"
            end
          end

          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end
