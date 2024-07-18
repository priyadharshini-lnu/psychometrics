# frozen_string_literal: true

require 'panko_override/utils'

module PankoOverride
  module Serializer
    extend ActiveSupport::Concern
    include ::PankoOverride::Utils

    # rubocop:disable Metrics/BlockLength
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

          response[:schema_validation_error] =
            PankoOverride::SchemaValidationFailedResponse.call!(response, schema_class, errors)

          log_and_capture_exception(response[:schema_validation_error])
        end

        response
      end

      def serializer_class
        self.class
      end

      def serialize_to_json(_object)
        raise NoMethodError, 'serialize_to_json is not supported. Please use serialize instead.'
      end

      private

      def log_and_capture_exception(failure_response)
        exception_details = JSON.parse(failure_response)['message']

        Rails.logger.error(exception_details)
        Sentry.capture_exception(StandardError.new(exception_details))
      end
    end
    # rubocop:enable Metrics/BlockLength
  end
end
