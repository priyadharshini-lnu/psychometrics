# frozen_string_literal: true

module Administration
  module Projects
    class SecuritySettingSerializer < Panko::Serializer
      attributes :id, :project_id, :enforce_strong_password, :min_password_length,
                 :enforce_password_policy, :disable_password_reuse, :password_expiration, :send_unlock_email,
                 :auto_unlock_time, :attempts_to_lock, :lock_account, :restrict_sequences, :tfa_enabled,
                 :magic_link_expiry_in_seconds, :magic_link_enabled, :disallow_password_login,
                 :session_inactivity_timeout_in_seconds, :enable_recaptcha,
                 :external_logout_redirect_enabled, :external_logout_url
    end
  end
end
