# frozen_string_literal: true

module SamlSettings
  class ParseMetaData < BaseCommand
    NAMESPACES = {
      'md' => 'urn:oasis:names:tc:SAML:2.0:metadata',
      'ds' => 'http://www.w3.org/2000/09/xmldsig#'
    }.freeze

    def initialize(xml)
      @xml = xml
    end

    def call
      doc = Nokogiri::XML(@xml) { |config| config.strict.nonet }

      descriptor = find_idp_descriptor(doc)
      return broadcast(:error, I18n.t('admin.sso_settings_metadata_no_idp_descriptor')) unless descriptor

      broadcast(:ok, extract_fields(doc, descriptor))
    rescue Nokogiri::XML::SyntaxError
      broadcast(:error, I18n.t('admin.sso_settings_metadata_invalid_xml'))
    end

    private

    def find_idp_descriptor(doc)
      doc.at_xpath('//md:IDPSSODescriptor', NAMESPACES) ||
        doc.at_xpath('//IDPSSODescriptor')
    end

    def extract_fields(doc, descriptor)
      cert_pem, cert_expiry = extract_certificate(descriptor)

      {
        idp_entity_id: extract_entity_id(doc),
        idp_sso_url: extract_sso_url(descriptor),
        idp_slo_url: extract_slo_url(descriptor),
        idp_cert: cert_pem,
        certificate_expiry: cert_expiry&.iso8601
      }
    end

    def extract_entity_id(doc)
      node = doc.at_xpath('//md:EntityDescriptor', NAMESPACES) ||
             doc.at_xpath('//EntityDescriptor')
      node&.[]('entityID')
    end

    def extract_sso_url(descriptor)
      node = descriptor.at_xpath(
        'md:SingleSignOnService[@Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"]',
        NAMESPACES
      ) || descriptor.at_xpath('md:SingleSignOnService', NAMESPACES) ||
             descriptor.at_xpath('SingleSignOnService')
      node&.[]('Location')
    end

    def extract_slo_url(descriptor)
      node = descriptor.at_xpath('md:SingleLogoutService', NAMESPACES) ||
             descriptor.at_xpath('SingleLogoutService')
      node&.[]('Location')
    end

    def extract_certificate(descriptor)
      cert_text = descriptor.at_xpath('.//ds:X509Certificate', NAMESPACES)&.text&.strip
      return [nil, nil] if cert_text.blank?

      cert_pem = wrap_certificate(cert_text)
      cert_expiry = OpenSSL::X509::Certificate.new(cert_pem).not_after

      [cert_pem, cert_expiry]
    rescue OpenSSL::X509::CertificateError
      [cert_pem, nil]
    end

    def wrap_certificate(raw)
      return raw if raw.include?('-----BEGIN CERTIFICATE-----')

      "-----BEGIN CERTIFICATE-----\n#{raw}\n-----END CERTIFICATE-----"
    end
  end
end
