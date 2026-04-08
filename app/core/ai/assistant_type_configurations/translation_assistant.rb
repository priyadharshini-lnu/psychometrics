# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class TranslationAssistant < Base
      def base_params
        {
          temperature: 0.5,
          max_tokens: 2500,
          response_format: { type: 'json_schema' }
        }
      end

      def validate_type_specific_rules
        existing_assistant = assistant.class.where(assistant_type: assistant.assistant_type)
        existing_assistant = existing_assistant.where.not(id: assistant.id) if assistant.persisted?

        return [] unless existing_assistant.exists?

        [{
          field: :assistant_type,
          message: I18n.t('administration.ai_assistants.errors.platform_assistant_already_exists',
                          type: assistant.assistant_type)
        }]
      end
    end
  end
end
