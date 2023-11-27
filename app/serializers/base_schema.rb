# frozen_string_literal: true

class BaseSchema
  module ClassMethods
    def schema(response, serializer)
      return super if whitelisted_schemas.include?(self)

      existing_schema = super

      unless existing_schema.config.validate_keys
        raise PankoOverride::Exceptions::KeyValidationMissing,
              "Schema class '#{name}' does not have 'config.validate_keys' set to true"
      end
      existing_schema
    end
  end

  def self.inherited(subclass)
    subclass.class_eval do
      class << self
        prepend ClassMethods
      end
    end
  end

  def self.validate_schema!(response, serializer)
    schema(response, serializer).call(response)
  end

  def self.schema(response, serializer)
    raise NotImplementedError, 'define schema in subclass'
  end

  def self.whitelisted_schemas
    [UsersResultSchema]
  end
end
