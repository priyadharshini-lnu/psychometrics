# frozen_string_literal: true

module AdminAuth
  class ResolveSsoRedirect
    Result = Struct.new(:required, :url, keyword_init: true)

    def self.for_client(user:, client: nil, spoofing: false, impersonator: nil)
      return Result.new(required: false) if spoofing
      return Result.new(required: false) if impersonator.present?

      resolved_client = client || resolve_sole_client(user)
      return Result.new(required: false) unless resolved_client&.client_sso_setting&.saml_enforced?

      token = SamlIntentToken.encode(email: user.email)
      url   = AdminSubdomain.admin_url_for(resolved_client, path: '/users/saml/sign_in',
                                                            params: { saml_email_token: token })
      Result.new(required: true, url: url)
    end

    def self.resolve_sole_client(user)
      return nil unless AdminSubdomain.client_admin_sso_enabled?

      user.sole_admin_client
    end
    private_class_method :resolve_sole_client
  end
end
