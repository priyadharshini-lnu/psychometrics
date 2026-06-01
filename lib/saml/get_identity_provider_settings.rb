# frozen_string_literal: true

module Saml
  class GetIdentityProviderSettings
    include Rails.application.routes.url_helpers

    def initialize(subdomain)
      @subdomain = subdomain
    end

    def settings(_)
      if client_admin_subdomain?
        client_admin_saml_settings
      elsif @subdomain.present?
        project_saml_settings
      else
        admin_saml_settings
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "Client not found for subdomain: #{@subdomain} - #{e.message}"
    end

    def url_options
      url_options_for
    end

    private

    def client_admin_subdomain?
      AdminSubdomain.client_admin?(@subdomain)
    end

    def client_admin_saml_settings
      client_subdomain = AdminSubdomain.client_subdomain_from_admin(@subdomain)
      client = Client.find_by!(subdomain: client_subdomain)
      sso_setting = client.client_sso_setting

      unless sso_setting&.saml_login_allowed?
        Rails.logger.info "SSO not enabled for client #{client.id} (#{client_subdomain})"
        return nil
      end

      sso_setting.saml_settings(url_options_for(@subdomain))
    end

    def url_options_for(subdomain = Settings.subdomain)
      {
        host: Settings.domain,
        subdomain: subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      }
    end

    def project_saml_settings
      project = Client.find_by!(subdomain: @subdomain)
      project.saml_setting_details
    end

    def admin_saml_settings
      options = url_options
      {
        assertion_consumer_service_url: saml_user_session_url(options),
        assertion_consumer_service_binding: Settings.saml.assertion_consumer_service_binding,
        name_identifier_format: Settings.saml.name_identifier_format,
        issuer: metadata_user_session_url(options),
        idp_entity_id: Settings.saml.idp_entity_id,
        idp_sso_service_url: Settings.saml.idp_sso_service_url,
        idp_cert: ENV.fetch('SAML_IDP_CERT', nil)
      }
    end
  end
end
