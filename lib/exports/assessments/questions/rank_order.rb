# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class RankOrder < Base
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 0
        #   }, ...]
        # TO:
        #   [1, ...]
        def self.result(answers, question, _scoring = false)
          increase = %w[TextBox].include?(question.props['type']) ? 0 : 1
          answers = (answers || []).sort_by { |a| a['index'] }.map do |a|
            a['value'].is_a?(Numeric) ? a['value'] + increase : ''
          end
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
