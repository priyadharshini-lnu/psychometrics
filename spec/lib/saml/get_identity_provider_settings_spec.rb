# frozen_string_literal: true

require 'rails_helper'

describe Saml::GetIdentityProviderSettings do
  describe '#settings' do
    it 'returns project SAML settings for end-user subdomain' do
      saml_setting = create(:saml_setting, test_settings: { 'entity_id' => 'test_entity_id' }, entity_id: 'entity_id')
      result = described_class.new(saml_setting.project.subdomain).settings(nil)

      expect(result[:idp_entity_id]).to eq('entity_id')
    end

    it 'returns global admin SAML settings for blank subdomain' do
      result = described_class.new('').settings(nil)

      expect(result[:idp_entity_id]).to eq(Settings.saml.idp_entity_id)
      expect(result[:idp_sso_service_url]).to eq(Settings.saml.idp_sso_service_url)
    end

    context 'client admin subdomain' do
      let(:tenancy) { create(:tenancy, subdomain: 'acmecorp') }
      let(:valid_cert) { Rails.root.join('spec/fixtures/files/cert.pem').read }
      let(:metadata_request) { instance_double(ActionDispatch::Request, path: '/users/saml/metadata') }

      before do
        tenancy.client_sso_setting.update!(
          sso_enabled: true,
          idp_entity_id: 'https://idp.acme.com',
          idp_sso_url: 'https://idp.acme.com/sso/saml',
          idp_cert: valid_cert
        )
      end

      it 'returns client SSO settings for client admin subdomain' do
        result = described_class.new('acmecorp-admin').settings(nil)

        expect(result[:idp_entity_id]).to eq('https://idp.acme.com')
        expect(result[:idp_sso_service_url]).to eq('https://idp.acme.com/sso/saml')
        expect(result[:idp_cert]).to eq(valid_cert)
      end

      it 'returns client SSO settings even when client SSO is not enabled' do
        tenancy.client_sso_setting.update_column(:sso_enabled, false)

        result = described_class.new('acmecorp-admin').settings(nil)

        expect(result[:assertion_consumer_service_url]).to be_present
        expect(result[:issuer]).to be_present
      end

      it 'returns client SSO settings when client SSO is not enabled for metadata endpoint' do
        tenancy.client_sso_setting.update_column(:sso_enabled, false)

        result = described_class.new('acmecorp-admin').settings(nil)

        expect(result[:assertion_consumer_service_url]).to be_present
        expect(result[:issuer]).to be_present
      end

      it 'returns settings with nil IdP fields when client has no persisted SSO setting' do
        tenancy.client_sso_setting.destroy
        tenancy.reload

        result = described_class.new('acmecorp-admin').settings(nil)

        expect(result[:assertion_consumer_service_url]).to be_present
        expect(result[:issuer]).to be_present
        expect(result[:idp_entity_id]).to be_nil
        expect(result[:idp_sso_service_url]).to be_nil
      end

      it 'returns settings with nil IdP fields when client has no SSO setting for metadata endpoint' do
        tenancy.client_sso_setting.destroy
        tenancy.reload

        result = described_class.new('acmecorp-admin').settings(nil)

        expect(result[:assertion_consumer_service_url]).to be_present
        expect(result[:issuer]).to be_present
        expect(result[:idp_entity_id]).to be_nil
        expect(result[:idp_sso_service_url]).to be_nil
      end
    end
  end
end
