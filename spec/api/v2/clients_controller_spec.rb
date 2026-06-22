# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ClientsController, type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:include_resource_meta) { 'permissions' }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:superadmin) { create(:superadmin) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  before { sign_in(superadmin) }

  describe 'GET /clients/' do
    it 'Clients List' do
      get '/api/v2/administration/clients/',
          params: { include_resource_meta: include_resource_meta },
          headers: { 'Authorization' => authorization, 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      clients = JSON.parse(response.body)
      client_response = clients['data'].find { |c| c['id'] == client.id.to_s }
      expect(client_response).to have_key('id')
      expect(client_response).to have_attribute(:name).with_value(client.name)
      expect(client_response).to have_relationship(:project_manager).
        with_data({ 'id' => client.project_manager_id.to_s, 'type' => 'users' })
    end
  end

  describe 'POST /clients/' do
    it 'Create a client' do
      project_manager = create(:client_admin)
      body = {
        data: {
          type: 'clients',
          attributes: {
            name: 'Client 1',
            subdomain: 'client-1-subdomain',
            year: Time.zone.now.year,
            type: 'partner',
            country: 'India',
            number: '123'
          },
          relationships: {
            project_manager: {
              data: {
                type: 'users',
                id: project_manager.id.to_s
              }
            }
          }
        }
      }

      post '/api/v2/administration/clients/',
           params: body.to_json,
           headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      client_response = JSON.parse(response.body)['data']
      expect(client_response).to have_key('id')
      expect(client_response).to have_attribute(:name).with_value('Client 1')
      expect(client_response).to have_attribute(:year).with_value(Time.zone.now.year)
      expect(client_response).to have_attribute(:type).with_value('partner')
      expect(client_response).to have_attribute(:number).with_value('123')
      expect(client_response).to have_relationship(:project_manager).
        with_data({ 'id' => project_manager.id.to_s, 'type' => 'users' })
    end
  end

  describe 'PATCH /clients/{client_id}' do
    it 'Update a client' do
      client_to_update = create(:tenancy, name: 'Old Name', type: 'partner')
      project_manager = create(:client_admin)

      body = {
        data: {
          type: 'clients',
          id: client_to_update.id.to_s,
          attributes: {
            name: 'New Name',
            type: 'retail'
          },
          relationships: {
            project_manager: {
              data: {
                type: 'users',
                id: project_manager.id.to_s
              }
            }
          }
        }
      }

      patch "/api/v2/administration/clients/#{client_to_update.id}",
            params: body.to_json,
            headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      client_response = JSON.parse(response.body)['data']
      expect(client_response).to have_key('id')
      expect(client_response).to have_attribute(:name).with_value('New Name')
      expect(client_response).to have_attribute(:type).with_value('retail')
      expect(client_response).to have_attribute(:number).with_value(client_to_update.number)
      expect(client_response).to have_relationship(:project_manager).
        with_data({ 'id' => project_manager.id.to_s, 'type' => 'users' })
    end

    it 'returns 422 if subdomain contains reserved admin keyword' do
      client_to_update = create(:tenancy)
      body = {
        data: {
          type: 'clients',
          id: client_to_update.id.to_s,
          attributes: {
            subdomain: 'illegal-admin-test'
          }
        }
      }

      patch "/api/v2/administration/clients/#{client_to_update.id}",
            params: body.to_json,
            headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expected_error = I18n.t('admin.subdomain_admin_keyword')
      expect(json_response['errors'].first['detail']).to include(expected_error)
    end
  end

  describe 'DELETE /clients/{client_id}' do
    it 'Delete a client' do
      client_to_delete = create(:tenancy)

      delete "/api/v2/administration/clients/#{client_to_delete.id}",
             headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
      expect(Client.find_by(id: client_to_delete.id)).to eq(nil)
    end
  end
end
