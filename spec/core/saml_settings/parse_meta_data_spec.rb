# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SamlSettings::ParseMetaData do
  let(:metadata_xml) { Rails.root.join('spec/fixtures/files/saml_metadata.xml').read }

  describe '.call' do
    context 'with valid metadata XML' do
      it 'extracts all IdP fields' do
        result = described_class.call(metadata_xml)

        expect(result[:ok]).to include(
          idp_entity_id: 'https://idp.example.com/entity',
          idp_sso_url: 'https://idp.example.com/sso',
          idp_slo_url: 'https://idp.example.com/slo'
        )
      end

      it 'wraps the certificate with PEM markers' do
        result = described_class.call(metadata_xml)

        expect(result[:ok][:idp_cert]).to start_with('-----BEGIN CERTIFICATE-----')
        expect(result[:ok][:idp_cert]).to end_with('-----END CERTIFICATE-----')
      end

      it 'extracts certificate expiry date' do
        result = described_class.call(metadata_xml)

        expect(result[:ok][:certificate_expiry]).to eq('2023-01-13T07:15:25Z')
      end
    end

    context 'with metadata missing SLO service' do
      let(:metadata_xml) { super().gsub(%r{<md:SingleLogoutService[^>]+/>}, '') }

      it 'returns nil for idp_slo_url' do
        result = described_class.call(metadata_xml)

        expect(result[:ok][:idp_slo_url]).to be_nil
        expect(result[:ok][:idp_sso_url]).to be_present
      end
    end

    context 'with metadata missing certificate' do
      let(:metadata_xml) { super().gsub(%r{<md:KeyDescriptor.*?</md:KeyDescriptor>}m, '') }

      it 'returns nil for certificate fields' do
        result = described_class.call(metadata_xml)

        expect(result[:ok][:idp_cert]).to be_nil
        expect(result[:ok][:certificate_expiry]).to be_nil
      end
    end

    context 'with invalid XML' do
      let(:metadata_xml) { 'not valid xml <<<>>>' }

      it 'returns an error' do
        result = described_class.call(metadata_xml)

        expect(result[:error]).to be_present
      end
    end

    context 'with XML missing IDPSSODescriptor' do
      let(:metadata_xml) { '<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://sp.example.com"></md:EntityDescriptor>' }

      it 'returns an error' do
        result = described_class.call(metadata_xml)

        expect(result[:error]).to be_present
      end
    end

    context 'with certificate already wrapped in PEM markers' do
      let(:metadata_xml) do
        cert_content = Rails.root.join('spec/fixtures/files/cert.pem').read
        super().sub(%r{<ds:X509Certificate>.*</ds:X509Certificate>}m,
                    "<ds:X509Certificate>#{cert_content}</ds:X509Certificate>")
      end

      it 'does not double-wrap the certificate' do
        result = described_class.call(metadata_xml)

        expect(result[:ok][:idp_cert].scan('-----BEGIN CERTIFICATE-----').count).to eq(1)
      end
    end
  end
end
