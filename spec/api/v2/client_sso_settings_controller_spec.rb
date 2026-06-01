# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ClientSsoSettingsController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:client_sso_setting) { client.client_sso_setting }
  let!(:superadmin) { create(:superadmin) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }
  let(:headers) { { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' } }

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/clients/:client_id/client_sso_settings' do
    it 'returns client SSO settings' do
      get "/api/v2/administration/clients/#{client.id}/client_sso_settings",
          params: { 'filter[tenant_id_eq]' => client.id },
          headers: headers

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']).not_to be_empty
      expect(json_response['data'].first['attributes']).to include(
        'sso_enabled' => false,
        'sso_enforced' => false,
        'session_timeout' => nil
      )
    end
  end

  describe 'PATCH /api/v2/administration/clients/:client_id/client_sso_settings/:id' do
    it 'updates SSO settings' do
      body = {
        data: {
          type: 'client_sso_settings',
          id: client_sso_setting.id.to_s,
          attributes: {
            sso_enabled: true,
            idp_entity_id: 'https://idp.example.com/entity',
            idp_sso_url: 'https://idp.example.com/sso/saml',
            idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read,
            session_timeout: 3600
          }
        }
      }

      patch "/api/v2/administration/clients/#{client.id}/client_sso_settings/#{client_sso_setting.id}",
            params: body.to_json,
            headers: headers

      expect(response).to have_http_status(:ok)
      updated_setting = JSON.parse(response.body)['data']['attributes']
      expect(updated_setting['sso_enabled']).to eq(true)
      expect(updated_setting['idp_entity_id']).to eq('https://idp.example.com/entity')
      expect(updated_setting['session_timeout']).to eq(3600)
    end
  end

  describe 'POST /api/v2/administration/clients/:client_id/client_sso_settings/parse_metadata' do
    let(:metadata_xml) { Rails.root.join('spec/fixtures/files/saml_metadata.xml').read }
    let(:url) { "/api/v2/administration/clients/#{client.id}/client_sso_settings/parse_metadata" }

    it 'parses valid metadata XML and returns extracted fields' do
      body = { data: { type: 'client_sso_settings', attributes: { xml: metadata_xml } } }

      post url, params: body.to_json, headers: headers

      expect(response).to have_http_status(:ok)
      result = JSON.parse(response.body)
      expect(result).to include(
        'idp_entity_id' => 'https://idp.example.com/entity',
        'idp_sso_url' => 'https://idp.example.com/sso',
        'idp_slo_url' => 'https://idp.example.com/slo'
      )
      expect(result['idp_cert']).to start_with('-----BEGIN CERTIFICATE-----')
      expect(result['certificate_expiry']).to be_present
    end

    it 'returns 422 for invalid XML' do
      body = { data: { type: 'client_sso_settings', attributes: { xml: 'not valid xml <<<>>>' } } }

      post url, params: body.to_json, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors']).to be_present
    end
  end
end
