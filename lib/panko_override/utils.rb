# frozen_string_literal: true

module PankoOverride
  module Utils
    extend ActiveSupport::Concern

    def check_schema_class_is_present_and_valid!(serializer_class, _response)
      return if skip_schema_check?

      schema_class = schema_class(serializer_class)

      if schema_class.nil?
        raise PankoOverride::Exceptions::SchemaNotDefined,
              "Schema not defined for serializer '#{serializer_class}'"
      end

      unless schema_class.respond_to?(:validate_schema!)
        raise PankoOverride::Exceptions::SchemaNotDefined,
              "Schema class '#{schema_class.name}' does not respond to 'validate_schema!'"
      end
    end

    def schema_class(serializer_class = self.class)
      return @schema_class if defined?(@schema_class)

      nested_class = serializer_class.name.split('::')
      schema_class_name = nested_class.last.gsub('Serializer', 'Schema')
      nested_schema_class_name = nested_class[0...-1].push(schema_class_name).join('::')

      @schema_class = nested_schema_class_name.safe_constantize
    end

    def skip_schema_check?
      return serializer_class.skip_schema_check? if serializer_class.respond_to?(:skip_schema_check?)

      ENV['REAL_ENV'].present? && ENV['REAL_ENV'].start_with?('production')
    end
  end
end
