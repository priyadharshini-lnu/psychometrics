# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Default < Base
      def base_params
        # A default value is added so that
        # assistants will have somewhat similar behaviour irrespective of model used
        {
          max_tokens: 2000
        }
      end

      def validate_type_specific_rules
        []
      end

      def output_schema_class
        nil # No schema
      end

      # No context by default
      def output_schema_as_context
        nil
      end
    end
  end
end
