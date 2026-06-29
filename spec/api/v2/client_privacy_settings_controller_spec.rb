# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ClientPrivacySettingsController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:client_privacy_setting) { create(:client_privacy_setting, client: client) }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/clients/:client_id/client_privacy_settings' do
    it 'returns client privacy settings' do
      get "/api/v2/administration/clients/#{client.id}/client_privacy_settings",
          params: { 'filter[client_id_eq]' => client.id },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']).not_to be_empty
      expect(json_response['data'].first).to have_key('id')
    end
  end

  describe 'PATCH /api/v2/clients/:client_id/client_privacy_settings/:id' do
    it 'updates client privacy setting' do
      body = {
        data: {
          type: 'client_privacy_settings',
          id: client_privacy_setting.id.to_s,
          attributes: {
            disable_data_processing: true
          }
        }
      }

      patch "/api/v2/administration/clients/#{client.id}/client_privacy_settings/#{client_privacy_setting.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      updated_setting = JSON.parse(response.body)['data']['attributes']
      expect(updated_setting['disable_data_processing']).to eq(true)
    end
  end
end
