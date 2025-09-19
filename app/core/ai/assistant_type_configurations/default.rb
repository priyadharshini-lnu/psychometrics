# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Default < Base
      # Default parameters for all assistants
      def default_params
        {}
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
