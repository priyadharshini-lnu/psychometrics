# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::ResolveSsoRedirect do
  describe '.for_client' do
    let(:user) { create(:user) }
    let(:client) { create(:tenancy) }

    # --- sole-client path (no explicit client passed) ---

    context 'when client_admin_sso is disabled' do
      before { allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(false) }

      it 'returns required: false' do
        expect(described_class.for_client(user: user).required).to be false
      end
    end

    context 'when client_admin_sso is enabled and user has no sole admin client' do
      before do
        allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
        allow(user).to receive(:sole_admin_client).and_return(nil)
      end

      it 'returns required: false' do
        expect(described_class.for_client(user: user).required).to be false
      end
    end

    context 'when client_admin_sso is enabled and sole client does not enforce SAML' do
      before do
        allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
        allow(user).to receive(:sole_admin_client).and_return(client)
      end

      it 'returns required: false' do
        expect(described_class.for_client(user: user).required).to be false
      end
    end

    context 'when client_admin_sso is enabled and sole client enforces SAML for all' do
      before do
        allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
        client.client_sso_setting.update!(sso_enabled: true, sso_enforced: true, enforce_for: 'all',
                                          idp_entity_id: 'https://idp.example.com',
                                          idp_sso_url: 'https://idp.example.com/sso/saml',
                                          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read)
        allow(user).to receive(:sole_admin_client).and_return(client)
        allow(AdminSubdomain).to receive(:admin_url_for).and_return('https://client.example.com/users/saml/sign_in?saml_email_token=tok')
      end

      it 'returns required: true with the SSO url' do
        result = described_class.for_client(user: user)

        expect(result.required).to be true
        expect(result.url).to eq('https://client.example.com/users/saml/sign_in?saml_email_token=tok')
      end
    end

    context 'when client_admin_sso is enabled and sole client enforces SAML for specific domain' do
      before do
        allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
        client.client_sso_setting.update!(sso_enabled: true, sso_enforced: false, enforce_for: 'specific_domains',
                                          enforced_domains: ['example.com'],
                                          idp_entity_id: 'https://idp.example.com',
                                          idp_sso_url: 'https://idp.example.com/sso/saml',
                                          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read)
        allow(user).to receive(:sole_admin_client).and_return(client)
        allow(AdminSubdomain).to receive(:admin_url_for).and_return('https://client.example.com/users/saml/sign_in?saml_email_token=tok')
      end

      it 'returns required: true if user email matches' do
        user.update!(email: 'user@example.com')
        result = described_class.for_client(user: user)

        expect(result.required).to be true
      end

      it 'returns required: false if user email does not match' do
        user.update!(email: 'user@other.com')
        result = described_class.for_client(user: user)

        expect(result.required).to be false
      end
    end

    # --- explicit client path (client handoff/selection) ---

    context 'when spoofing is true' do
      it 'returns required: false without checking SAML' do
        result = described_class.for_client(user: user, client: client, spoofing: true)

        expect(result.required).to be false
      end
    end

    context 'when impersonator is present' do
      let(:impersonator) { create(:superadmin) }

      it 'returns required: false' do
        result = described_class.for_client(user: user, client: client, impersonator: impersonator)

        expect(result.required).to be false
      end
    end

    context 'when explicit client does not enforce SAML' do
      it 'returns required: false' do
        result = described_class.for_client(user: user, client: client)

        expect(result.required).to be false
      end
    end

    context 'when explicit client enforces SAML for all and no spoofing or impersonation' do
      before do
        client.client_sso_setting.update!(sso_enabled: true, sso_enforced: true, enforce_for: 'all',
                                          idp_entity_id: 'https://idp.example.com',
                                          idp_sso_url: 'https://idp.example.com/sso/saml',
                                          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read)
        allow(AdminSubdomain).to receive(:admin_url_for).and_return('https://client.example.com/users/saml/sign_in?saml_email_token=tok')
      end

      it 'returns required: true' do
        expect(described_class.for_client(user: user, client: client).required).to be true
      end

      it 'returns the SSO url' do
        expect(described_class.for_client(user: user, client: client).url).to eq('https://client.example.com/users/saml/sign_in?saml_email_token=tok')
      end
    end

    context 'when explicit client enforces SAML for specific domains' do
      before do
        client.client_sso_setting.update!(sso_enabled: true, sso_enforced: false, enforce_for: 'specific_domains',
                                          enforced_domains: ['example.com'],
                                          idp_entity_id: 'https://idp.example.com',
                                          idp_sso_url: 'https://idp.example.com/sso/saml',
                                          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read)
        allow(AdminSubdomain).to receive(:admin_url_for).and_return('https://client.example.com/users/saml/sign_in?saml_email_token=tok')
      end

      it 'returns required: true if user email matches' do
        user.update!(email: 'user@example.com')
        expect(described_class.for_client(user: user, client: client).required).to be true
      end

      it 'returns required: false if user email does not match' do
        user.update!(email: 'user@other.com')
        expect(described_class.for_client(user: user, client: client).required).to be false
      end
    end
  end
end
