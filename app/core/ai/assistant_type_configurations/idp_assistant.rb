# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class IdpAssistant < Base
      # Default parameters for IDP Assistant
      def default_params
        {
          temperature: 0.2,
          response_format: { type: 'json_schema' },
          max_tokens: 1500,
          # This is to ensure number of database connections are not exhaused in single process
          parallel_tool_calls: false
        }
      end

      # IDP Assistant has specific validation rules
      def validate_type_specific_rules
        # No specific validation rules for IDP Assistant currently
        []
      end
    end
  end
end
