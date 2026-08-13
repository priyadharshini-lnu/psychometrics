# frozen_string_literal: true

module Administration
  class ClientContextSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers

    attributes :id, :name, :subdomain, :logo_url, :sso_enabled, :sso_enforced, :sso_domain_enforcement_enabled

    def logo_url
      object.client_design_setting&.logo_url
    end

    def sso_enabled
      object.client_sso_setting&.saml_login_allowed? || false
    end

    def sso_enforced
      object.client_sso_setting&.saml_enforced? || false
    end

    def sso_domain_enforcement_enabled
      object.client_sso_setting&.enforce_for_specific_domains? || false
    end
  end
end
