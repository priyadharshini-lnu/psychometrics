# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class GraphicSlider < Base
        include ImportExportConst

        # FROM:
        #   [{"value": 5}]
        # TO:
        #   [5]
        def self.result(user_result, question, _scoring = false, _export_with_labels = false)
          answers = get_answers(user_result, question)
          answers = (answers || []).pluck('value')
          answers << get_duration(user_result, question)
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.question_id_header(question)
          ["QID#{question.id}", duration_header(question)]
        end
      end
    end
  end
end
