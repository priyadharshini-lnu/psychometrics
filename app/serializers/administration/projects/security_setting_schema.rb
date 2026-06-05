# frozen_string_literal: true

module Administration
  module Projects
    class SecuritySettingSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:project_id).filled(:int?)
          required(:enforce_strong_password).filled(:bool?)
          required(:min_password_length).filled(:int?)
          required(:enforce_password_policy).filled(:bool?)
          required(:disable_password_reuse).filled(:bool?)
          required(:password_expiration).maybe(:int?)
          required(:send_unlock_email).maybe(:bool?)
          required(:auto_unlock_time).maybe(:int?)
          required(:attempts_to_lock).maybe(:int?)
          required(:lock_account).filled(:bool?)
          required(:restrict_sequences).filled(:bool?)
          required(:tfa_enabled).filled(:bool?)
          required(:magic_link_expiry_in_seconds).maybe(:int?)
          required(:magic_link_enabled).filled(:bool?)
          required(:disallow_password_login).filled(:bool?)
          required(:session_inactivity_timeout_in_seconds).maybe(:int?)
          required(:enable_recaptcha).maybe(:bool?)
          required(:external_logout_redirect_enabled).maybe(:bool?)
          required(:external_logout_url).maybe(:str?)
        end
      end
    end
  end
end
