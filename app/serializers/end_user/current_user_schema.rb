# frozen_string_literal: true

module EndUser
  class CurrentUserSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:email).filled(:str?)
        required(:first_name).filled(:str?)
        required(:last_name).filled(:str?)
        required(:full_name).filled(:str?)
        required(:role).filled(:str?)
        required(:is_anonym).maybe(:bool?)
        required(:photo).maybe(:str?)
        required(:timezone).maybe(:str?)
        required(:custom_fields).maybe(:hash?)
        required(:age).maybe(:int?)
        required(:gender).maybe(:str?)
        required(:locale).maybe(:str?)
        required(:profile_completion_percentage) { int? | float? }
        required(:last_sign_in_at).maybe(:str?)
        optional(:updated_at).filled(:str?)
        required(:update_profile_required).filled(:bool?)
        required(:update_profile_message).maybe(:str?)
        required(:back_url).maybe(:str?)
      end
    end
  end
end
