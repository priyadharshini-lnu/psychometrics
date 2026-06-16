# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UserSavedFiltersController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:user_saved_filter) do
    create(:user_saved_filter, user: superadmin, name: 'Test Filter', resource_type: 'report_approvals_my_tasks',
   filter_params: { 'filterable_fields' => 'rails', 'with_resource_state' => 'active' })
  end
  before { sign_in(superadmin) }

  describe 'GET /user_saved_filters/' do
    it 'User Saved Filter List' do
      get '/api/v2/administration/user_saved_filters/',
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      parsed_response = data.find { |d| d['id'] == user_saved_filter.id.to_s }
      expect(parsed_response).to have_key('id')
      expect(parsed_response['attributes']['name']).to eq('Test Filter')
    end
  end

  describe 'POST /user_saved_filters/' do
    it 'Create User Saved Filter' do
      body = {
        data: {
          type: 'user_saved_filters',
          attributes: {
            name: 'New Filter',
            resource_type: 'report_approvals_my_tasks',
            filter_params: { 'filterable_fields' => 'new', 'with_resource_state' => 'active' }
          }
        }
      }

      post '/api/v2/administration/user_saved_filters/', params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
    end
  end

  describe 'PATCH /user_saved_filters/:id' do
    it 'Update User Saved Filter' do
      body = {
        data: {
          type: 'user_saved_filters',
          id: user_saved_filter.id.to_s,
          attributes: {
            name: 'Updated Filter Name'
          }
        }
      }

      patch "/api/v2/administration/user_saved_filters/#{user_saved_filter.id}", params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE /user_saved_filters/:id' do
    it 'Delete User Saved Filter' do
      delete "/api/v2/administration/user_saved_filters/#{user_saved_filter.id}",
             headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:no_content)
    end
  end
end
