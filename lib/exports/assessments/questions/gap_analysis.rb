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
        def self.result(answers, question, _scoring = false, _export_with_labels = false)
          answers = (answers || []).map do |answer|
            [
              (answer['scale'] + 1),
              answer['values'].map { |v| v + 1 }.join(',')
            ]
          end.flatten
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.question_id_and_choice_headers(question)
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
