# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WebhookSystem::Job do
  describe '.build_client' do
    let(:webhook) { create(:webhook, auth_type: auth_type) }

    context 'when auth_type is no_auth' do
      let(:auth_type) { 'no_auth' }

      it 'does not add basic auth' do
        client = described_class.build_client(webhook)
        expect(client.builder.handlers).not_to include(Faraday::Request::Authorization)
      end

      it 'does not fetch OAuth token even if oauth fields are present' do
        webhook.update!(
          oauth_grant_type: 'client_credentials',
          oauth_token_url: 'https://example.com/oauth/token'
        )

        expect(WebhookSystem::OauthToken).not_to receive(:fetch)
        described_class.build_client(webhook)
      end
    end

    context 'when auth_type is basic_auth' do
      let(:auth_type) { 'basic_auth' }

      before do
        webhook.update!(username: 'user', password: 'pass')
      end

      it 'adds basic auth when username and password are present' do
        client = described_class.build_client(webhook)
        expect(client.builder.handlers).to include(Faraday::Request::Authorization)
      end

      it 'does not fetch OAuth token even if oauth fields are present' do
        webhook.update!(
          oauth_grant_type: 'client_credentials',
          oauth_token_url: 'https://example.com/oauth/token'
        )

        expect(WebhookSystem::OauthToken).not_to receive(:fetch)
        described_class.build_client(webhook)
      end
    end

    context 'when auth_type is api_key_auth' do
      let(:auth_type) { 'api_key_auth' }

      before do
        webhook.update!(api_key: 'test-api-key')
      end

      it 'adds Authorization header with Bearer token' do
        client = described_class.build_client(webhook)
        expect(client.headers['Authorization']).to eq('Bearer test-api-key')
      end

      it 'uses custom header when api_key_header is set' do
        webhook.update!(api_key_header: 'X-API-Key')
        client = described_class.build_client(webhook)
        expect(client.headers['X-API-Key']).to eq('test-api-key')
      end

      it 'does not fetch OAuth token even if oauth fields are present' do
        webhook.update!(
          oauth_grant_type: 'client_credentials',
          oauth_token_url: 'https://example.com/oauth/token'
        )

        expect(WebhookSystem::OauthToken).not_to receive(:fetch)
        described_class.build_client(webhook)
      end
    end

    context 'when auth_type is oauth' do
      let(:auth_type) { 'oauth' }
      let(:webhook) do
        create(:webhook,
               auth_type: 'oauth',
               oauth_grant_type: 'client_credentials',
               oauth_token_url: 'https://example.com/oauth/token',
               oauth_client_id: 'client_id',
               oauth_client_secret: 'client_secret',
               oauth_scope: 'read write')
      end

      it 'fetches OAuth token and adds Authorization header' do
        expect(WebhookSystem::OauthToken).to receive(:fetch).with(webhook).and_return('oauth-token')

        client = described_class.build_client(webhook)
        expect(client.headers['Authorization']).to eq('Bearer oauth-token')
      end
    end
  end
end
