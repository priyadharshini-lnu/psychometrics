# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class FactorSelect < Base
        include ImportExportConst

        def self.result(user_result, question, export_with_labels: false, concat_answers: true, **_args)
          all_answers = []
          answers = get_answers(user_result, question) || []

          result = if export_with_labels
                     answers.map do |answer|
                       factor_name = Factor.find_by(id: answer)&.name
                       factor_name || 'Unknown Factor'
                     end
                   else
                     answers
                   end

          all_answers << (concat_answers && result.is_a?(Array) ? result.join(';') : result)
          all_answers << get_duration(user_result, question)
        end

        def self.question_id_header(question)
          ["QID#{question.id}", duration_header(question)]
        end
      end
    end
  end
end
