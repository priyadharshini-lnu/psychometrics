# frozen_string_literal: true

module PankoOverride
  module ArraySerializer
    extend ActiveSupport::Concern

    include PankoOverride::Utils

    # rubocop:disable Metrics/BlockLength
    included do
      alias_method :existing_to_a, :to_a

      def to_a
        responses = existing_to_a
        return responses if skip_schema_check? || responses.size > 100

        check_schema_class_is_present_and_valid!(serializer_class, responses)
        schema_class = schema_class(serializer_class)

        responses.each_with_index do |response, i|
          validation_result = schema_class.validate_schema!(response, self)
          next unless validation_result.failure?

          errors = validation_result.errors.map do |error|
            {
              title: error.text,
              path: [i].concat(error.path).join('/')
            }
          end

          response[:schema_validation_error] =
            PankoOverride::SchemaValidationFailedResponse.call!(response, schema_class, errors)

          log_and_capture_exception(response[:schema_validation_error])

          return responses
        end

        responses
      end

      def as_json
        to_a
      end

      def serializer_class
        @each_serializer
      end

      def to_json(*_args)
        raise NoMethodError, 'to_json is not supported. Please use to_a or as_json instead.'
      end

      def serialize_to_json(_subjects)
        raise NoMethodError, 'serialize_to_json is not supported. Please use to_a or as_json instead.'
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
