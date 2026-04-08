# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class IdpAssistant < Base
      # IDP Assistant needs to support structured output **along with tools**
      # custom provider which is oci doesn't allows this with cohere.command-a, this should be handled
      UNSUPPORTED_STRUCTURED_OUTPUT_MODEL = %w[cohere.command-a].freeze

      def base_params
        {
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: 'json_schema' },
          # This is to ensure number of database connections are not exhausted in single process
          parallel_tool_calls: false
        }
      end

      # IDP Assistant has specific validation rules
      def validate_type_specific_rules
        # No specific validation rules for IDP Assistant currently
        []
      end

      def output_schema_as_context
        return super if model_supports_structured_output?

        output_schema_class.as_context
      end

      private

      def model_supports_structured_output?
        UNSUPPORTED_STRUCTURED_OUTPUT_MODEL.exclude?(assistant.ai_provider_for_model['model'])
      end
    end
  end
end
