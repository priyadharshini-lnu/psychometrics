# frozen_string_literal: true

module AI
  module OutputSchemas
    class TranslationAssistant < Base
      SCHEMA_AS_CONTEXT = <<~SCHEMA_CONTEXT
        The assistant must return JSON with two fields:
        - translated_texts: the list of translated texts
        - detected_language: the language name detected in the input text
      SCHEMA_CONTEXT

      def self.context
        SCHEMA_AS_CONTEXT
      end

      array :translated_texts, description: 'List of translated texts' do
        object do
          integer :module_id, description: 'The ID of the module'
          array :texts, description: 'The translated texts' do
            object do
              string :key, description: 'The index of the text in module'
              string :text, description: 'The translated text'
            end
          end
        end
      end
      string :detected_language, description: 'The language detected in the input text'
    end
  end
end
