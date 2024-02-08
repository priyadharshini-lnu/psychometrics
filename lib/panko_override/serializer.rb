# frozen_string_literal: true

require 'panko_override/utils'

module PankoOverride
  module Serializer
    extend ActiveSupport::Concern
    include ::PankoOverride::Utils

    included do
      alias_method :existing_serialize, :serialize

      def serialize(object)
        response = existing_serialize(object)
        return response if skip_schema_check?

        check_schema_class_is_present_and_valid!(serializer_class, response)
        validation_result = schema_class.validate_schema!(response, self)
        if validation_result.failure?
          errors = validation_result.errors.map do |error|
            {
              title: error.text,
              path: error.path.join('/')
            }
          end
          raise PankoOverride::Exceptions::SchemaValidationFailed.new(response, schema_class, errors)
        end

        response
      end

      def serializer_class
        self.class
      end

      def serialize_to_json(_object)
        raise NoMethodError, 'serialize_to_json is not supported. Please use serialize instead.'
      end
    end
  end
end
