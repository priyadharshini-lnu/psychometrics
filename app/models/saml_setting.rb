# frozen_string_literal: true

class SamlSetting < ApplicationRecord
  audited except: %i[cert test_settings]
  include ApplicationConfigurationLoggable

  include Rails.application.routes.url_helpers

  belongs_to :project, class_name: 'Client'
  include Tenantable

  enum :name_identifier_format, { email: 0, persistent: 1 }, suffix: :name_identifier

  def details
    url_options = {
      host: Settings.domain,
      subdomain: project.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    }
    setting = attributes.slice('entity_id', 'sso_service_url', 'cert')

    {
      assertion_consumer_service_url: saml_user_session_url(url_options),
      assertion_consumer_service_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      name_identifier_format: name_identifier_format_setting,
      issuer: metadata_user_session_url(url_options),
      idp_entity_id: setting['entity_id'],
      idp_sso_service_url: setting['sso_service_url'],
      idp_cert: setting['cert']
    }
  end

  def name_identifier_format_setting
    if name_identifier_format == 'email'
      'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
    else
      'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent'
    end
  end

  def saml_login_allowed?
    enabled?
  end

  def saml_enforced?
    saml_login_allowed? && enforced?
  end
end
