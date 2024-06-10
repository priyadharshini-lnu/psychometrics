# frozen_string_literal: true

class MobileNumberVerificationSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:mobile_number).filled(:str?)
      required(:status).filled(:str?)
      required(:verification_token).filled(:str?)
    end
  end
end
