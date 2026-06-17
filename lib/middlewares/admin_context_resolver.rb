# frozen_string_literal: true

require_relative '../admin_subdomain'

module Middlewares
  class AdminContextResolver
    def initialize(app)
      @app = app
    end

    def call(env)
      resolve_context(env)
      @app.call(env)
    end

    private

    def resolve_context(env)
      request = Rack::Request.new(env)
      subdomain = AdminSubdomain.extract_subdomain(request.host)

      Current.client = nil
      ActsAsTenant.current_tenant = nil

      if AdminSubdomain.root_domain?(subdomain)
        Current.admin_context = :super_admin
      elsif AdminSubdomain.client_admin_sso_enabled? && AdminSubdomain.client_admin?(subdomain)
        Current.admin_context = :client_admin
        resolve_client(subdomain)
      else
        Current.admin_context = nil
      end
    end

    def resolve_client(subdomain)
      client_subdomain = AdminSubdomain.client_subdomain_from_admin(subdomain)
      return unless client_subdomain

      root = ActsAsTenant.without_tenant do
        client = find_client(client_subdomain)
        next unless client&.active?

        client.root
      end

      return unless root

      Current.client = root
      ActsAsTenant.current_tenant = root unless bypass_tenant_scoping?(root)
    end

    def find_client(subdomain)
      Client.enabled.find_by(subdomain: subdomain)
    rescue StandardError
      nil
    end

    def bypass_tenant_scoping?(client)
      TenantEnforcement.globally_disabled? || TenantEnforcement.subdomain_bypassed?(client.subdomain)
    end
  end
end
