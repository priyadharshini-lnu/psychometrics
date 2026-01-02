# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SamlServiceProvider, type: :model do
  let(:project) { create(:project) }
  let(:saml_service_provider) { build(:saml_service_provider, project: project) }

  describe '#issuer_uri' do
    it 'returns the correct issuer URI with service provider ID' do
      sp = create(:saml_service_provider, project: project)
      expected_uri = "https://test.localhost:3000/saml/idp/metadata/#{sp.id}"

      allow(Utility::Url).to receive(:generate).with(:root_url, subdomain: project.subdomain).and_return('https://test.localhost:3000/')

      expect(sp.issuer_uri).to eq(expected_uri)
    end
  end

  describe '#sso_service_url' do
    it 'returns the correct SSO service URL with service provider ID' do
      sp = create(:saml_service_provider, project: project)
      expected_url = "https://test.localhost:3000/saml/idp/auth/#{sp.id}"

      allow(Utility::Url).to receive(:generate).with(:root_url, subdomain: project.subdomain).and_return('https://test.localhost:3000/')

      expect(sp.sso_service_url).to eq(expected_url)
    end
  end

  describe '#display_name' do
    context 'when name is present' do
      it 'returns the name' do
        saml_service_provider.name = 'Test Provider'
        expect(saml_service_provider.display_name).to eq('Test Provider')
      end
    end

    context 'when name is blank' do
      it 'returns the entity_id' do
        saml_service_provider.name = ''
        expect(saml_service_provider.display_name).to eq(saml_service_provider.entity_id)
      end
    end
  end

  describe '#idp_certificate' do
    context 'when certificate is present' do
      it 'decrypts and returns the certificate' do
        certificate_content = 'test-certificate-content'
        encrypted_cert = Base64.encode64(Encryptor.encrypt(certificate_content))

        sp = create(:saml_service_provider, project: project)
        sp.update!(encrypted_idp_certificate: encrypted_cert)

        expect(sp.idp_certificate).to eq(certificate_content)
      end
    end

    context 'when certificate is blank' do
      it 'returns nil' do
        sp = create(:saml_service_provider, project: project)
        sp.update!(encrypted_idp_certificate: nil)

        expect(sp.idp_certificate).to be_nil
      end
    end
  end

  describe '#idp_private_key' do
    context 'when private key is present' do
      it 'decrypts and returns the private key' do
        private_key_content = 'test-private-key-content'
        encrypted_key = Base64.encode64(Encryptor.encrypt(private_key_content))

        sp = create(:saml_service_provider, project: project)
        sp.update!(encrypted_idp_private_key: encrypted_key)

        expect(sp.idp_private_key).to eq(private_key_content)
      end
    end

    context 'when private key is blank' do
      it 'returns nil' do
        sp = create(:saml_service_provider, project: project)
        sp.update!(encrypted_idp_private_key: nil)

        expect(sp.idp_private_key).to be_nil
      end
    end
  end

  describe '#rotate_certificate!' do
    it 'generates and saves new certificate and private key' do
      initial_cert_data = {
        certificate: 'initial-certificate',
        private_key: 'initial-private-key'
      }
      allow(Saml::CertificateGenerator).to receive(:generate_self_signed_certificate).and_return(initial_cert_data)

      sp = create(:saml_service_provider, project: project)

      original_cert = sp.idp_certificate
      original_key = sp.idp_private_key

      new_cert_data = {
        certificate: 'new-certificate',
        private_key: 'new-private-key'
      }
      allow(Saml::CertificateGenerator).to receive(:generate_self_signed_certificate).and_return(new_cert_data)

      sp.rotate_certificate!

      expect(sp.idp_certificate).to eq('new-certificate')
      expect(sp.idp_private_key).to eq('new-private-key')
      expect(sp.idp_certificate).not_to eq(original_cert)
      expect(sp.idp_private_key).not_to eq(original_key)
    end
  end
end
