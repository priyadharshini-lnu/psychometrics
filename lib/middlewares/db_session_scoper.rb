# frozen_string_literal: true

require 'active_record/session_store'
require_relative '../admin_subdomain'

module Middlewares
  # DB-backed session store with per-subdomain cookie scoping for admin portals.
  # - Admin subdomains (e.g., client-admin.domain.com) get unique session cookies
  # - All other requests share the default session cookie
  class DbSessionScoper
    def initialize(app, options = {})
      @app = app
      @options = options
      @default_store = ActionDispatch::Session::ActiveRecordStore.new(app, options)
    end

    def call(env)
      store_client_admin_context(env)
      store_for_request(env).call(env)
    end

    private

    def store_for_request(env)
      return @default_store unless AdminSubdomain.client_admin_sso_enabled?

      host = Rack::Request.new(env).host.to_s
      subdomain = AdminSubdomain.extract_subdomain(host)

      return @default_store unless AdminSubdomain.client_admin?(subdomain)

      build_admin_store(subdomain)
    end

    def build_admin_store(subdomain)
      client_slug = AdminSubdomain.client_subdomain_from_admin(subdomain)
      sanitized = client_slug.gsub(/[^a-z0-9_-]/i, '')

      ActionDispatch::Session::ActiveRecordStore.new(
        @app,
        @options.merge(key: "_psychometrics_#{sanitized}_admin_session")
      )
    end

    def store_client_admin_context(env)
      return unless AdminSubdomain.client_admin_sso_enabled?

      host = Rack::Request.new(env).host.to_s
      subdomain = AdminSubdomain.extract_subdomain(host)

      return unless AdminSubdomain.client_admin?(subdomain)

      client_slug = AdminSubdomain.client_subdomain_from_admin(subdomain)
      RequestStore.store[:client_admin_subdomain] = client_slug if client_slug
    end
  end
end
