# frozen_string_literal: true

module Auth
  class CurrentUserSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:email).maybe(:str?)
        required(:reset_password_token).maybe(:str?)
        required(:invitation_token).maybe(:str?)
      end
    end
  end
end
