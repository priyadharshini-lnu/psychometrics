# frozen_string_literal: true

module Reports
  class UserSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:first_name).filled(:str?)
        required(:last_name).filled(:str?)
        required(:email).filled(:str?)
        required(:photo).maybe(:str?)
      end
    end
  end
end
