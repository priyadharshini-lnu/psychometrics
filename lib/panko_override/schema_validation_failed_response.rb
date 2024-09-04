# frozen_string_literal: true

module PankoOverride
  class SchemaValidationFailedResponse < BaseCommand
    private_attr_reader :response, :schema, :errors

    def initialize(response, schema, errors)
      @response = response
      @schema = schema
      @errors = errors
    end

    def call
      response = {
        type: 'PankoOverride::Exceptions::SchemaValidationFailed',
        message: message,
        meta: meta,
        exception: true
      }.to_json

      broadcast(:ok, response)
    end

    private

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
