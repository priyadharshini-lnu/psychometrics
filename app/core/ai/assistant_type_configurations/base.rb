# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Base
      # Models that use max_completion_tokens instead of max_tokens
      MODELS_USING_COMPLETION_TOKENS = %w[gpt-5-nano gpt-5-mini gpt-5.2-chat-latest o3 gpt-5].freeze

      # Models that do not support the temperature parameter
      MODELS_WITHOUT_TEMPERATURE = %w[gpt-5-nano gpt-5-mini gpt-5.2-chat-latest o3 gpt-5].freeze

      attr_reader :assistant

      def initialize(assistant)
        @assistant = assistant
      end

      # Builds the final params for the model by normalizing base_params.
      # Handles model-specific differences such as renamed keys and unsupported params.
      def default_params
        normalize_params_for_model(base_params)
      end

      # Declare the semantic intent of the assistant (temperature, max_tokens, etc.).
      # Model-capability differences are handled automatically by default_params.
      # Must be implemented by subclasses.
      def base_params
        raise NotImplementedError, "#{self.class} must implement base_params method"
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

      private

      def assistant_model
        @assistant_model ||= assistant.ai_provider_for_model['model']
      end

      def normalize_params_for_model(params)
        params = rename_max_tokens_if_needed(params)
        remove_temperature_if_unsupported(params)
      end

      def rename_max_tokens_if_needed(params)
        return params unless MODELS_USING_COMPLETION_TOKENS.include?(assistant_model)

        max_tokens = params.delete(:max_tokens)
        params.merge(max_completion_tokens: max_tokens)
      end

      def remove_temperature_if_unsupported(params)
        return params unless MODELS_WITHOUT_TEMPERATURE.include?(assistant_model)

        params.except(:temperature)
      end
    end
  end
end
