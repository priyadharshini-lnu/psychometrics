# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Factory
      TYPE_CONFIGURATIONS = {
        'content_writer' => ContentWriter,
        'idp_assistant' => IdpAssistant,
        'development_actions_assistant' => DevelopmentActionsAssistant,
        'writing_assistant' => WritingAssistant
      }.freeze

      def self.for(assistant)
        configuration_class = TYPE_CONFIGURATIONS[assistant.assistant_type] || Default

        configuration_class.new(assistant)
      end
    end
  end
end
