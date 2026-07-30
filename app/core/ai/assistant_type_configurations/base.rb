# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class Base
      attr_reader :assistant

      def initialize(assistant)
        @assistant = assistant
      end

      # Builds the final params for the model by normalizing base_params.
      # Database-level model_params (max_tokens, temperature) override the type defaults.
      # Handles model-specific differences such as renamed keys and unsupported params.
      def default_params
        normalize_params_for_model(base_params.merge(overrideable_db_params))
      end

      # Returns only the normalized DB-level model_params (max_tokens, temperature).
      # Applied unconditionally so they are never skipped by skip_default_params.
      def db_params
        normalize_params_for_model(overrideable_db_params)
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

      def overrideable_db_params
        assistant.model_params.symbolize_keys.slice(:max_tokens, :temperature)
      end

      def normalize_params_for_model(params)
        params = rename_max_tokens_if_needed(params)
        remove_temperature_if_unsupported(params)
      end

      # Reads from provider config: capabilities.uses_completion_tokens: true
      def uses_completion_tokens?
        assistant.ai_provider_for_model&.dig('capabilities', 'uses_completion_tokens') == true
      end

      # Reads from provider config: capabilities.supports_temperature: false
      # Defaults to true so models without explicit config are unaffected.
      def supports_temperature?
        assistant.ai_provider_for_model&.dig('capabilities', 'supports_temperature') != false
      end

      def rename_max_tokens_if_needed(params)
        return params unless uses_completion_tokens?

        max_tokens = params.delete(:max_tokens)
        params.merge(max_completion_tokens: max_tokens)
      end

      def remove_temperature_if_unsupported(params)
        return params if supports_temperature?

        params.except(:temperature)
      end
    end
  end
end
