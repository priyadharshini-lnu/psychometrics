# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class FactorSelect < Base
        include ImportExportConst

        def self.result(user_result, question, _scoring = false, _export_with_labels = false)
          all_answers = []
          answers = get_answers(user_result, question) || []
          all_answers << answers.join(';')
          all_answers << get_duration(user_result, question)
        end

        def self.question_id_header(question)
          ["QID#{question.id}", duration_header(question)]
        end
      end
    end
  end
end
