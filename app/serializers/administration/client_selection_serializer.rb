# frozen_string_literal: true

module Administration
  class ClientSelectionSerializer < Panko::Serializer
    attributes :id, :name, :subdomain, :highest_role, :sso_enforced, :sso_domain_enforcement_enabled, :logo_url,
               :has_active_session

    def highest_role
      context[:highest_roles_by_client_id]&.dig(object.id)
    end

    def sso_enforced
      object.client_sso_setting&.saml_enforced? || false
    end

    def sso_domain_enforcement_enabled
      object.client_sso_setting&.enforce_for_specific_domains? || false
    end

    def logo_url
      object.client_design_setting&.logo_url
    end

    def has_active_session
      context[:active_ids]&.include?(object.id) || false
    end
  end
end
