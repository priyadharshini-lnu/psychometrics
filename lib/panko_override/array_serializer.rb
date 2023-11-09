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
        return responses if skip_schema_check?

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
          raise PankoOverride::Exceptions::SchemaValidationFailed.new(response, schema_class, errors)
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
    end
    # rubocop:enable Metrics/BlockLength
  end
end
