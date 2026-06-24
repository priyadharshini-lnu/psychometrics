# frozen_string_literal: true

module Administration
  class ClientSelectionSerializer < Panko::Serializer
    attributes :id, :name, :subdomain, :highest_role, :sso_enforced, :logo_url, :has_active_session

    def highest_role
      context[:highest_roles_by_client_id]&.dig(object.id)
    end

    def sso_enforced
      object.client_sso_setting&.saml_enforced? || false
    end

    def logo_url
      object.design_setting&.logo&.url
    end

    def has_active_session
      context[:active_ids]&.include?(object.id) || false
    end
  end
end
