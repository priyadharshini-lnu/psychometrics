# frozen_string_literal: true

class HoganCredentialSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:url).filled(:str?)
      required(:user_id).filled(:str?)
      required(:password).filled(:str?)
      required(:unique_id).filled(:str?)
      required(:first_name).filled(:str?)
      required(:last_name).filled(:str?)
      required(:language_id).filled(:str?)
      required(:direct_assessment_id).filled(:str?)
      required(:display_informed_consent).filled(:str?)
      required(:return_url).filled(:str?)
    end
  end
end
