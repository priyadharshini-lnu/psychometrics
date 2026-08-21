# frozen_string_literal: true

module SamlSettings
  class Form < Rectify::Form
    mimic :saml_setting

    attribute :enabled, Boolean
    attribute :enforced, Boolean
    attribute :enforce_for, String, default: 'none'
    attribute :enforced_domains, Array
    attribute :entity_id, String
    attribute :sso_service_url, String
    attribute :cert, String
    attribute :after_signout_url, String
    attribute :name_identifier_format, String
    attribute :email_pipetext, String

    validates :entity_id, :sso_service_url, :cert, presence: true, unless: :clear_saml_setting?
    validates :after_signout_url, http_url: { presence: false }
    validate :certificate_invalid, if: -> { cert.present? }
    validates :email_pipetext, presence: true, if: -> { name_identifier_format == 'persistent' }
    validates :enforce_for, inclusion: { in: SamlSetting.enforce_fors.keys }
    validates :enforced_domains, presence: true, if: -> { enforce_for == 'specific_domains' }

    def certificate_invalid
      OpenSSL::X509::Certificate.new(cert)
    rescue OpenSSL::X509::CertificateError
      errors.add(:cert, :invalid_cert)
    end

    def clear_saml_setting?
      return false if enabled? || context&.new_record

      (SamlSettings::Form.new.attributes.keys - %i[enforced enforce_for enforced_domains]).all? { |attribute| public_send(attribute).blank? }
    end
  end
end
