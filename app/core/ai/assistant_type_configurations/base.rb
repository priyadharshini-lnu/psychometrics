# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Base
      attr_reader :assistant

      def initialize(assistant)
        @assistant = assistant
      end

      # Default params to be used when making AI calls
      # Must be implemented by subclasses
      def default_params
        raise NotImplementedError, "#{self.class} must implement default_params method"
      end

      # Returns the RubyLLM::Schema class for this assistant type
      # Can be overridden by subclasses
      def output_schema_class
        return nil unless AI::OutputSchemas::Registry.has_schema?(assistant.assistant_type)

        AI::OutputSchemas::Registry.schema_for(assistant.assistant_type)
      end

      # Generate text-based schema context for system prompt
      # Can be overridden by subclasses
      def output_schema_as_context
        if has_ruby_llm_schema?
          output_schema_class.context
        else
          ''
        end
      end

      # Type-specific validation rules
      # Must be implemented by subclasses
      def validate_type_specific_rules
        raise NotImplementedError, "#{self.class} must implement validate_type_specific_rules method"
      end

      # Check if this assistant type has a RubyLLM::Schema defined
      def has_ruby_llm_schema?
        AI::OutputSchemas::Registry.has_schema?(assistant.assistant_type)
      end
    end
  end
end
