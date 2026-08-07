# frozen_string_literal: true

module AdminAuth
  class SamlRedirectGuard
    Result = Struct.new(:required, :token, keyword_init: true)

    def self.for_user(user:, return_url: nil)
      return Result.new(required: false) if AdminAuth.saml_disabled_for_admins?
      return Result.new(required: false) unless user&.saml_enforced_for_admins?

      token = SamlIntentToken.encode(email: user.email, return_url: return_url)
      Result.new(required: true, token: token)
    end
  end
end
