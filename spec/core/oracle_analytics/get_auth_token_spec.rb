# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OracleAnalytics::GetAuthToken do
  let(:service) { described_class.new }
  let(:client_id) { 'dummy_client_id' }
  let(:client_secret) { 'dummy_client_secret' }
  let(:cache_key) { described_class.cache_key }
  let(:config) { Settings.oac }
  let(:token_response) do
    {
      'access_token' => 'dummy_access_token'
    }.to_json
  end

  before do
    allow(Rails.cache).to receive(:fetch).with(cache_key, expires_in: 55.minutes).
      and_yield
  end

  describe '#call' do
    context 'when the token is valid' do
      before do
        stub_request(:post, "#{config[:base_api_url]}/oauth2/v1/token").
          with(
            headers: {
              'Accept' => 'application/json',
              'Content-Type' => 'application/x-www-form-urlencoded'
            },
            body: URI.encode_www_form(grant_type: 'client_credentials', scope: 'urn:opc:idm:__myscopes__')
          ).
          to_return(status: 200, body: token_response, headers: {})
      end

      it 'broadcasts :ok with the access token' do
        expect { service.call }.to broadcast(:ok, 'dummy_access_token')
      end

      it 'caches the token' do
        expect(Rails.cache).to receive(:fetch).with(cache_key, expires_in: 55.minutes).and_yield
        service.call
      end
    end

    context 'when the token request fails' do
      before do
        stub_request(:post, "#{config[:base_api_url]}/oauth2/v1/token").
          to_return(status: 401, body: 'Unauthorized', headers: {})
      end

      it 'raises an error' do
        expect { service.call }.to raise_error(RuntimeError, /Invalid response from/)
      end
    end
  end

  describe '.clear_token' do
    it 'deletes the token from cache' do
      expect(Rails.cache).to receive(:delete_matched).with(cache_key)
      described_class.clear_token
    end
  end
end
