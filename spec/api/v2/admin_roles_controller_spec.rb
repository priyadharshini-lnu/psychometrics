# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AdminRolesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:client) { create(:tenancy) }
  let!(:admin_role) { create(:admin_role, client_id: client.id) }
  let(:client_id) { client.id }
  let(:admin_role_id) { admin_role.id }

  before { sign_in(superadmin) }

  describe 'GET /clients/:client_id/admin_roles' do
    it 'returns admin roles list' do
      get "/api/v2/administration/clients/#{client_id}/admin_roles"
      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).not_to be_empty
      expect(data.first).to have_key('id')
      expect(data.first['type']).to eq('admin_roles')
    end
  end

  describe 'POST /clients/:client_id/admin_roles' do
    it 'creates an admin role' do
      body = {
        data: {
          type: 'admin_roles',
          attributes: {
            name: 'Test Admin Role'
          }
        }
      }

      post "/api/v2/administration/clients/#{client_id}/admin_roles",
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data['attributes']['name']).to eq('Test Admin Role')
    end
  end

  describe 'GET /clients/:client_id/admin_roles/:admin_role_id' do
    it 'returns an admin role' do
      get "/api/v2/administration/clients/#{client_id}/admin_roles/#{admin_role_id}"

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data['id']).to eq(admin_role_id.to_s)
    end
  end

  describe 'PATCH /clients/:client_id/admin_roles/:admin_role_id' do
    it 'updates an admin role' do
      body = {
        data: {
          type: 'admin_roles',
          id: admin_role_id.to_s,
          attributes: {
            name: 'Updated Admin Role'
          }
        }
      }

      patch "/api/v2/administration/clients/#{client_id}/admin_roles/#{admin_role_id}",
            params: body.to_json,
            headers: {
              'Content-Type' => 'application/vnd.api+json'
            }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data['attributes']['name']).to eq('Updated Admin Role')
    end
  end

  describe 'DELETE /clients/:client_id/admin_roles/:admin_role_id' do
    it 'deletes an admin role' do
      delete "/api/v2/administration/clients/#{client_id}/admin_roles/#{admin_role_id}"

      expect(response).to have_http_status(:no_content)
    end
  end
end
