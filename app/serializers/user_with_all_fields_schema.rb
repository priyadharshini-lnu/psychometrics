# frozen_string_literal: true

class UserWithAllFieldsSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:first_name).filled(:str?)
      required(:last_name).filled(:str?)
      required(:email).filled(:str?)
      required(:age).maybe(:int?)
      required(:gender).maybe(:str?)
      required(:locale).maybe(:str?)
      required(:photo).maybe(:str?)
      required(:custom_fields).array do
        hash do
          required(:name).filled(:str?)
          required(:value).filled(:str?)
        end
      end
      required(:datasheet).maybe(:hash?)
    end
  end
end
