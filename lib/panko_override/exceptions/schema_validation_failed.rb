# frozen_string_literal: true

module PankoOverride
  module Exceptions
    class SchemaValidationFailed < Base
      private_attr_reader :response, :schema, :errors

      def initialize(response, schema, errors)
        @response = response
        @schema = schema
        @errors = errors
        super(message)
      end

      def meta
        {
          errors: errors,
          response: response,
          schema: schema.name
        }
      end

      def message
        [
          "Schema: #{schema.name}",
          "Errors: #{errors}",
          "Response: #{response}"
        ].join("\n")
      end
    end
  end
end
