# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class GraphicSlider < Base
        # FROM:
        #   [{"value": 5}]
        # TO:
        #   [5]
        def self.result(answers, question, _scoring = false, _export_with_labels = false)
          answers = (answers || []).map { |answer| answer['value'] }
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.question_id_header(question)
          ["QID#{question.id}"]
        end
      end
    end
  end
end
