# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class GapAnalysis < Base
        # FROM:
        # {
        #   "scale": 0,
        #   "choice": 0,
        #   "values": [0,2]
        # }
        # TO:
        # [1, 1, '1,3']
        def self.result(answers, _question, _scoring = false)
          answers = (answers || []).map do |answer|
            [
              (answer['scale'] + 1),
              answer['values'].map { |v| v + 1 }.join(',')
            ]
          end.flatten
          required_size = header(question).size
          Utility::Array.ensure_size(answers, required_size)
        end

        def self.headers_by_choices(question)
          question_id_header = []
          question_choices_header = []
          question.props['choices'].to_i.times do |c|
            question_id_header << ["QID#{question.id}_#{c + 1}", "QID#{question.id}_#{c + 1}_WHY"]
            question_choices_header << [question.props.dig('choicesTexts', c),
                                        "#{question.props.dig('choicesTexts', c)} | Why?"]
          end
          { question_id_header: question_id_header.flatten, question_choice_header: question_choices_header.flatten }
        end
      end
    end
  end
end
