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
        def self.result(answers, question, _scoring = false)
          answers = (answers || []).map { |a| a['value'] }
          required_size = header(question).size
          Utility::Array.ensure_size(answers, required_size)
        end

        def self.headers_by_choices(question)
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
