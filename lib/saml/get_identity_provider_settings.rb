# frozen_string_literal: true

module Saml
  class GetIdentityProviderSettings
    def initialize(subdomain)
      @subdomain = subdomain
    end

    def settings(_)
      if @subdomain.present?
        project_saml_settings
      else
        admin_saml_settings
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "Client not found for subdomain: #{@subdomain} - #{e.message}"
    end

    private

    def project_saml_settings
      project = Client.find_by!(subdomain: @subdomain)
      project.saml_setting_details
    end

    def admin_saml_settings
      {
        assertion_consumer_service_url: Settings.saml.assertion_consumer_service_url,
        assertion_consumer_service_binding: Settings.saml.assertion_consumer_service_binding,
        name_identifier_format: Settings.saml.name_identifier_format,
        issuer: Settings.saml.issuer,
        idp_entity_id: Settings.saml.idp_entity_id,
        idp_sso_service_url: Settings.saml.idp_sso_service_url,
        idp_cert: ENV.fetch('SAML_IDP_CERT', nil)
      }
    end
  end
end
