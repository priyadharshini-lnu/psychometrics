# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class ContentAnalysisAssistant < Base
      def base_params
        {
          temperature: 0.1,
          response_format: { type: 'json_schema' },
          max_tokens: 4000
        }
      end

      def validate_type_specific_rules
        []
      end
    end
  end
end
