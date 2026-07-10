# frozen_string_literal: true

module Administration
  class ClientContextSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers

    attributes :id, :name, :subdomain, :logo_url, :sso_enabled, :sso_enforced

    def logo_url
      object.client_design_setting&.logo_url
    end

    def sso_enabled
      object.client_sso_setting&.saml_login_allowed? || false
    end

    def sso_enforced
      object.client_sso_setting&.saml_enforced? || false
    end
  end
end
