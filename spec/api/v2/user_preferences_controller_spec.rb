# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UserPreferencesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:user_preference) do
    create(:user_preference, user: superadmin, config_key: 'theme', category: 'theme', payload: { 'color' => 'blue' })
  end

  before { sign_in(superadmin) }

  describe 'GET /user_preferences/' do
    it 'User Preference List' do
      get '/api/v2/administration/user_preferences/',
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      parsed_response = data.find { |d| d['id'] == user_preference.id.to_s }
      expect(parsed_response).to have_key('id')
      expect(parsed_response['attributes']['config_key']).to eq('theme')
    end
  end

  describe 'POST /user_preferences/' do
    let(:body) do
      {
        data: {
          type: 'user_preferences',
          attributes: {
            category: 'theme',
            config_key: 'appearance',
            payload: { mode: 'dark', light: 'marsh-light', dark: 'marsh-dark' }
          }
        }
      }
    end

    # Regression: create authorizes against the CLASS, so a policy reaching for record.user_id 500s every first write.
    it 'Create User Preference' do
      post '/api/v2/administration/user_preferences/', params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
    end

    it 'attributes the preference to the signed-in user' do
      post '/api/v2/administration/user_preferences/', params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      created = UserPreference.find(JSON.parse(response.body)['data']['id'])
      expect(created.user_id).to eq(superadmin.id)
    end

    it 'upserts onto the existing row instead of duplicating' do
      post '/api/v2/administration/user_preferences/', params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }
      first_id = JSON.parse(response.body)['data']['id']

      updated = body.deep_dup
      updated[:data][:attributes][:payload][:mode] = 'light'

      expect do
        post '/api/v2/administration/user_preferences/', params: updated.to_json,
             headers: { 'Content-Type' => 'application/vnd.api+json' }
      end.not_to change(UserPreference, :count)

      expect(JSON.parse(response.body)['data']['id']).to eq(first_id)
      expect(UserPreference.find(first_id).payload['mode']).to eq('light')
    end
  end

  describe 'PATCH /user_preferences/:id' do
    it 'Update User Preference' do
      body = {
        data: {
          type: 'user_preferences',
          id: user_preference.id.to_s,
          attributes: { payload: { mode: 'light', light: 'marsh-light', dark: 'marsh-dark' } }
        }
      }

      patch "/api/v2/administration/user_preferences/#{user_preference.id}", params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(user_preference.reload.payload['mode']).to eq('light')
    end
  end

  describe "another user's preference" do
    let!(:other_preference) { create(:user_preference, user: create(:superadmin)) }

    it 'is not updatable' do
      body = {
        data: {
          type: 'user_preferences',
          id: other_preference.id.to_s,
          attributes: { payload: { 'mode' => 'dark' } }
        }
      }

      patch "/api/v2/administration/user_preferences/#{other_preference.id}", params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).not_to have_http_status(:ok)
      expect(other_preference.reload.payload['mode']).to be_nil
    end

    it 'is absent from the index' do
      get '/api/v2/administration/user_preferences/', headers: { 'Content-Type' => 'application/json' }

      ids = JSON.parse(response.body)['data'].pluck('id')
      expect(ids).not_to include(other_preference.id.to_s)
    end
  end

  describe 'DELETE /user_preferences/:id' do
    it 'Delete User Preference' do
      delete "/api/v2/administration/user_preferences/#{user_preference.id}",
             headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:no_content)
    end
  end
end
