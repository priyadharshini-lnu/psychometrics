# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ApiKeysController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:application_user) { create(:application_user) }
  let!(:user_api_key) { create(:api_key, user: application_user) }
  let(:user_id) { application_user.id }

  before { sign_in(superadmin) }

  describe 'GET /users/:user_id/api_keys' do
    it 'returns API keys list' do
      get "/api/v2/administration/users/#{user_id}/api_keys"

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)
      api_key_response = response_data['data'].find { |d| d['id'] == user_api_key.id.to_s }
      expect(api_key_response).to have_key('id')
      expect(api_key_response).to have_attribute(:key).with_value(user_api_key.key)
    end
  end

  describe 'POST /users/:user_id/api_keys' do
    it 'creates an API key' do
      body = {
        data: {
          type: 'api_keys',
          attributes: {
            description: 'New API Key description'
          }
        }
      }

      post "/api/v2/administration/users/#{user_id}/api_keys", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      api_key_response = JSON.parse(response.body)['data']
      expect(api_key_response).to have_key('id')
    end
  end

  describe 'PATCH /users/:user_id/api_keys/:api_key_id' do
    it 'updates an API key' do
      body = {
        data: {
          type: 'api_keys',
          id: user_api_key.id.to_s,
          attributes: {
            description: 'Updated API Key description'
          }
        }
      }

      patch "/api/v2/administration/users/#{user_id}/api_keys/#{user_api_key.id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      api_key_response = JSON.parse(response.body)['data']
      expect(api_key_response).to have_key('id')
    end
  end
end
