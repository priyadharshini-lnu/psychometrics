# frozen_string_literal: true

require 'acts_as_tenant/sidekiq'
require_relative '../../lib/tenant_enforcement'

ActsAsTenant.configure do |config|
  config.require_tenant = lambda {
    return false if TenantEnforcement.globally_disabled?
    return false if TenantEnforcement.client_bypassed?
    return false if defined?(Rails::Console)
    return false if Current.application_component == 'end_user' || Current.admin_context.nil?
    return false if Current.super_admin_context?
    return false if Sidekiq.server? && ActsAsTenant.current_tenant.nil?

    true
  }
end
