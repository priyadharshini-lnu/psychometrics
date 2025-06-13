# frozen_string_literal: true

class IdpUserSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:email).filled(:str?)
      required(:photo).maybe(:str?)
      required(:role).maybe(:str?)
      required(:fields).array do
        hash do
          required(:name).filled(:str?)
          required(:value).maybe(:str?)
        end
      end
    end
  end
end
