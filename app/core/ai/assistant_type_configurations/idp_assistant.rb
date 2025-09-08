# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class IdpAssistant < Base
      # Default parameters for IDP Assistant
      def default_params
        {
          temperature: 0.0,
          response_format: { type: 'json_object' }
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
