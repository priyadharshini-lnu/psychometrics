module SecondFactorAuthenticatable
  extend ActiveSupport::Concern

  included do
    # Overridden method to send direct OTP codes. This is automatically called when a user logs in
    # unless they have TOTP enabled.
    def send_two_factor_authentication_code(code)
      SendTwoFactorCodeJob.perform_later(self, code)
    end

    # By default, second factor authentication is required for each user.
    # Override here to change that.
    def need_two_factor_authentication?(__request = nil)
      return true unless is?(:regular)

      project ? project.second_factor_enabled? : false
    end

    # To set TOTP to disabled
    def totp_enabled?
      false
    end

    def reset_second_factor_attempts_counter!
      update!(second_factor_attempts_count: 0)
    end
  end
end
