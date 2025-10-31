# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class DevelopmentActionsAssistant < Base
      # Default parameters for Development Actions Assistant
      def default_params
        {
          response_format: { type: 'json_schema' },
          max_tokens: 1500
        }
      end

      # Development Actions Assistant has specific validation rules
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
