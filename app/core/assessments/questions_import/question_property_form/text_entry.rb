# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class TextEntry < Base
        mimic :questions_import_text_entry_form

        attribute :type, String
        attribute :scoreWithAIEnabled, String
        attribute :aiScoringModelAnswer, String
        attribute :aiScoringKeywords, String

        validates :type, presence: true
        validates :type, inclusion: { in: %w[SingleLine MultiLine EssayTextBox] }, if: -> { type.present? }

        def default_values
          {
            'allowDictation' => false
          }
        end

        def attributes
          attrs = super
          attrs['scoreWithAIEnabled'] = ActiveModel::Type::Boolean.new.cast(attrs[:scoreWithAIEnabled])
          attrs
        end
      end
    end
  end
end
