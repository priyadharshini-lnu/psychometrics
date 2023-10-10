# frozen_string_literal: true

class SamlSetting < ApplicationRecord
  audited except: %i[cert test_settings]

  include Rails.application.routes.url_helpers

  belongs_to :project, class_name: 'Client'

  def details(setting_type)
    url_options = {
      host: Settings.domain,
      subdomain: project.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    }
    setting = attributes.slice('entity_id', 'sso_service_url', 'cert')
    setting.merge!(test_settings) if setting_type == :test

    {
      assertion_consumer_service_url: saml_user_session_url(url_options),
      assertion_consumer_service_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      name_identifier_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      issuer: metadata_user_session_url(url_options),
      idp_entity_id: setting['entity_id'],
      idp_sso_service_url: setting['sso_service_url'],
      idp_cert: setting['cert']
    }
  end

  def make_test_setting_permanent!
    update!(test_settings.merge(verified: true))
  end

  def saml_login_allowed?
    verified? && enabled?
  end

  def saml_enforced?
    saml_login_allowed? && enforced?
  end
end
