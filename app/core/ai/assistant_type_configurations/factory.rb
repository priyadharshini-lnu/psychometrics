# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Factory
      TYPE_CONFIGURATIONS = {
        'content_writer' => ContentWriter,
        'idp_assistant' => IdpAssistant
      }.freeze

      def self.for(assistant)
        configuration_class = TYPE_CONFIGURATIONS[assistant.assistant_type] || Default

        configuration_class.new(assistant)
      end
    end
  end
end
