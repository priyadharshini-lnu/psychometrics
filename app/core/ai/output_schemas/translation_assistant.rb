# frozen_string_literal: true

module AI
  module OutputSchemas
    class TranslationAssistant < Base
      SCHEMA_AS_CONTEXT = <<~SCHEMA_CONTEXT
        The assistant must return JSON with one field:
        - translated_texts: the main list of translated texts
        - detected_language: the language name detected in the input text
      SCHEMA_CONTEXT

      def self.context
        SCHEMA_AS_CONTEXT
      end

      array :translated_texts, of: :string, description: 'List of translated texts'
      string :detected_language, description: 'The language detected in the input text'
    end
  end
end
