# frozen_string_literal: true

module AI
  module AssistantTypeConfigurations
    class ContentWriter < Base
      # Default parameters for Content Writer

      ALLOWED_DEPENDENCIES = %w[datasheet assessments campaign_factors].freeze

      def default_params
        # Content writer should always use tool for the response
        {
          tool_choice: 'required',
          max_tokens: 2000
        }
      end

      # Content Writer uses dynamic output schema from database
      def output_schema_class
        nil # Content Writer doesn't use RubyLLM::Schema
      end

      # Content Writer generates schema context from database records
      def output_schema_as_context
        return '' if assistant.assistant_output_schema_keys.blank?

        context_lines = ['Following is the assistant output schema:']
        context_lines << '<assistant_output_schema>'
        assistant.assistant_output_schema_keys.each do |osk|
          context_lines << "- **#{osk.key}** (#{osk.key_type}): #{osk.description}"
        end
        context_lines << '</assistant_output_schema>'
        context_lines.join("\n")
      end

      # Content Writer specific validation rules
      def validate_type_specific_rules
        errors = []

        # Validate dependencies
        if dependencies.nil?
          errors << { field: :dependencies, message: 'must be present' }
        elsif !dependencies.is_a?(Array)
          errors << { field: :dependencies, message: 'must be an array' }
        else
          invalid = dependencies - ALLOWED_DEPENDENCIES
          unless invalid.empty?
            errors << { field: :dependencies, message: "contains invalid entry(ies): #{invalid.join(', ')}" }
          end
        end

        errors
      end

      private

      def dependencies
        assistant.dependencies
      end
    end
  end
end
