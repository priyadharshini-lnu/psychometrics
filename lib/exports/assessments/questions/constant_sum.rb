# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class ConstantSum < Base
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 12
        #   }, ...]
        # TO:
        #   [12, ...]
        def self.result(answers, question, _scoring = false, _export_with_labels = false)
          answers = (answers || []).map { |a| a['value'] }
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          question.props['choices'].to_i.times do |c|
            question_id_header << "QID#{question.id}_#{c + 1}"
            question_choices_header << question.props.dig('choicesTexts', c)
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end
