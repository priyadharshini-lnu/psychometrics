# frozen_string_literal: true

class UserSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:first_name).filled(:str?)
      required(:last_name).filled(:str?)
      required(:email).filled(:str?)
      required(:photo).maybe(:str?)
      required(:age).maybe(:int?)
      required(:gender).maybe(:str?)
    end
  end
end
