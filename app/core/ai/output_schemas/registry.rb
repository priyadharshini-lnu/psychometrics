# frozen_string_literal: true

require_relative 'idp_assistant'
require_relative 'development_actions_assistant'

module AI
  module OutputSchemas
    module Registry
      # Registry of assistant types that have RubyLLM::Schema defined
      SCHEMA_REGISTRY = {
        idp_assistant: IdpAssistant,
        development_actions_assistant: DevelopmentActionsAssistant
      }.freeze

      # Check if a given assistant type has a RubyLLM::Schema defined
      def self.has_schema?(assistant_type)
        SCHEMA_REGISTRY.key?(assistant_type.to_sym)
      end

      def self.schema_for(assistant_type)
        SCHEMA_REGISTRY[assistant_type.to_sym]
      end

      def self.available_types
        SCHEMA_REGISTRY.keys
      end
    end
  end
end
