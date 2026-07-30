# frozen_string_literal: true

module TenantEnforcement
  module_function

  def globally_disabled?
    Settings.tenant_scoping.disabled
  end

  def superadmin_scoping_disabled?
    Settings.tenant_scoping.superadmin_scoping_disabled
  end

  def subdomain_bypassed?(subdomain)
    return false if subdomain.blank?

    bypass_list = Array(Settings.tenant_scoping.bypass_subdomains).
                  map { |s| s.to_s.downcase.strip }.
                  compact_blank
    return false if bypass_list.empty?

    subdomain.to_s.downcase.in?(bypass_list)
  end

  def client_bypassed?
    subdomain_bypassed?(Current.client&.subdomain)
  end
end
