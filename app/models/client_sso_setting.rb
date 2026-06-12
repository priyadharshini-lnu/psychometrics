# frozen_string_literal: true

class ClientSsoSetting < ApplicationRecord
  audited except: %i[idp_cert]
  include ApplicationConfigurationLoggable

  belongs_to :client, foreign_key: :tenant_id

  validates :client, presence: true
  validates :session_timeout, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true

  before_validation :normalize_session_timeout

  def self.ransackable_attributes(_auth_object = nil)
    %w[id tenant_id]
  end

  with_options if: :sso_enabled? do
    validates :idp_entity_id, :idp_sso_url, :idp_cert, presence: true
    validate :certificate_validity
  end

  validate :enforced_requires_enabled

  def saml_login_allowed?
    sso_enabled?
  end

  def saml_enforced?
    sso_enabled? && sso_enforced?
  end

  def email_domain_allowed?(email)
    return true if allowed_domains.blank?

    domain = email.to_s.split('@').last&.downcase
    allowed_domains.any? { |d| d.downcase == domain }
  end

  def saml_settings(url_options)
    {
      assertion_consumer_service_url: saml_consumer_url(url_options),
      assertion_consumer_service_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      name_identifier_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      issuer: saml_metadata_url(url_options),
      idp_entity_id: idp_entity_id,
      idp_sso_service_url: idp_sso_url,
      idp_cert: idp_cert
    }
  end

  def saml_consumer_url(url_options)
    Rails.application.routes.url_helpers.saml_user_session_url(url_options)
  end

  def saml_metadata_url(url_options)
    Rails.application.routes.url_helpers.metadata_user_session_url(url_options)
  end

  private

  def normalize_session_timeout
    self.session_timeout = nil if session_timeout.to_i.zero?
  end

  def certificate_validity
    return if idp_cert.blank?

    OpenSSL::X509::Certificate.new(idp_cert)
  rescue OpenSSL::X509::CertificateError
    errors.add(:idp_cert, :invalid)
  end

  def enforced_requires_enabled
    return unless sso_enforced? && !sso_enabled?

    errors.add(:sso_enforced, I18n.t('dry_errors.errors.client_sso_settings.sso_enforced_requires_enabled'))
  end
end
