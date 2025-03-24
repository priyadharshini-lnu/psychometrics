# frozen_string_literal: true

module TwoFactorAuthenticatable
  extend ActiveSupport::Concern

  included do
    # Overridden method to send direct OTP codes. This is automatically called when a user logs in
    # unless they have TOTP enabled.
    def send_two_factor_authentication_code(code)
      SendTwoFactorCodeJob.perform_later(self, code)
    end

    # By default, two factor authentication is required for each user.
    # Override here to change that.
    def need_two_factor_authentication?(request)
      return false if request&.session&.dig(:saml_auth) # Skip 2FA if logging in via SAML
      return false unless Settings.features.two_factor_enabled
      return false unless enable_2fa?

      is?(:regular) ? project.tfa_enabled? : true
    end

    # To set TOTP to disabled
    def totp_enabled?
      false
    end

    def reset_second_factor_attempts_counter!
      update!(second_factor_attempts_count: 0)
    end

    def invalidate_current_otp!
      update!(direct_otp: random_base10(self.class.direct_otp_length))
    end
  end
end
