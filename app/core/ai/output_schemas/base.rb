# frozen_string_literal: true

module AI
  module OutputSchemas
    class Base < RubyLLM::Schema
      class InvalidResponseStructureError < StandardError; end

      # Base class for all AI output schemas

      # Class method to get schema context for system prompts
      # Should be implemented by subclasses to provide specific context
      def self.context
        raise NotImplementedError, "#{self} must implement context class method"
      end

      def self.validate_response(response)
        errors = []
        required_keys = new.to_json_schema.dig(:schema, :required) || []
        unless response.is_a?(Hash)
          errors << 'Please ensure the response is an JSON object'
        end
        required_keys.each do |key|
          errors << "Please ensure the response includes the \"#{key}\" key" unless response.key?(key.to_s)
        end

        throw InvalidResponseStructureError.new(errors.join(', ')) unless errors.empty?
      end

      # Class method to get schema as context for system prompts
      # Useful when working with models which doesn't support structured response natively
      def self.as_context
        <<~OUTPUT_SCHEMA_AS_CONTEXT
          <output_schema>
            #{context}

            #{new.to_json_schema[:schema]}
            Ensure your response is valid JSON and matches the schema exactly. Do not include any text outside the JSON object.
            The response will be parsed against JSON parser

            IMPORTANT: Do NOT wrap the JSON object in any code blocks or markdown formatting.
            WRONG: ```json {...}```
            CORRECT: {...}
          </output_schema>
        OUTPUT_SCHEMA_AS_CONTEXT
      end
    end
  end
end
