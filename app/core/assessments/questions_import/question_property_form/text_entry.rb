# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class TextEntry < Base
        mimic :questions_import_text_entry_form

        attribute :type, String

        validates :type, presence: true
        validates :type, inclusion: { in: %w[SingleLine MultiLine EssayTextBox] }, if: -> { type.present? }

        def default_values
          {
            'allowDictation' => false
          }
        end
      end
    end
  end
end
