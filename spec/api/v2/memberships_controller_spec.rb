# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::MembershipsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:client_admin) { create(:client_admin_membership) }
  before { sign_in(superadmin) }

  describe 'GET /memberships/' do
    it 'Membership list' do
      client_admin_membership = create(:client_admin_membership)

      get '/api/v2/administration/memberships/',
          params: {
            'filter[client_id_eq]' => client_admin_membership.client_id.to_s,
            'filter[with_role]' => 'client_admin',
            'query[include_resource_meta]' => 'true'
          },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)
      membership_response = response_data['data'].find { |d| d['id'] == client_admin_membership.id.to_s }
      expect(response_data).to have_meta(
        'permissions' => {
          'edit' => true,
          'login_as' => true,
          'remove' => true,
          'reset_password' => true,
          'send_mail' => true,
          'export' => true
        }
      )
      expect(membership_response).to have_attribute(:first_name).with_value(client_admin_membership.user.first_name)
      expect(membership_response).to have_attribute(:last_name).with_value(client_admin_membership.user.last_name)
      expect(membership_response).to have_attribute(:email).with_value(client_admin_membership.user.email)
      expect(membership_response).to have_attribute(:grant_names).with_value(client_admin_membership.grants.data)
    end
  end

  describe 'GET /memberships/{membership_id}' do
    it 'Membership' do
      get "/api/v2/administration/memberships/#{client_admin.id}",
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      membership_response = JSON.parse(response.body)['data']
      expect(membership_response).to have_key('id')
      expect(membership_response).to have_attribute(:name).with_value(client_admin.user.name)
      expect(membership_response).to have_attribute(:first_name).with_value(client_admin.user.first_name)
      expect(membership_response).to have_attribute(:last_name).with_value(client_admin.user.last_name)
      expect(membership_response).to have_attribute(:client_id).with_value(client_admin.client_id)
      expect(membership_response).to have_attribute(:role).with_value(client_admin.role)
      expect(membership_response).to have_relationship(:user).
        with_data({ 'id' => client_admin.user_id.to_s, 'type' => 'users' })
    end
  end

  describe 'POST /memberships/' do
    it 'Create a membership' do
      user = create(:user)
      client = create(:tenancy)
      body = jsonapi_resource_request(
        'memberships',
        {
          user_id: [user.id.to_s],
          first_name: user.first_name,
          last_name: user.last_name,
          role: 'client_admin',
          client_id: client.id.to_s,
          grant_names: {
            clients: ['view']
          }
        }
      )

      post '/api/v2/administration/memberships/',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      membership_response = JSON.parse(response.body)['data']
      expect(membership_response).to have_key('id')
      expect(membership_response).to have_attribute(:name).with_value(user.name)
      expect(membership_response).to have_attribute(:first_name).with_value(user.first_name)
      expect(membership_response).to have_attribute(:last_name).with_value(user.last_name)
      expect(membership_response).to have_attribute(:client_id).with_value(client.id)
      expect(membership_response).to have_attribute(:role).with_value('client_admin')
      expect(membership_response).to have_relationship(:user).
        with_data({ 'id' => user.id.to_s, 'type' => 'users' })
    end
  end

  describe 'PATCH /memberships/{membership_id}' do
    it 'Update a membership' do
      admin_role = create(:admin_role, client_id: client_admin.client_id)
      user = client_admin.user
      body = jsonapi_resource_request(
        'memberships',
        {
          id: client_admin.id.to_s,
          email: client_admin.user.email,
          first_name: client_admin.user.first_name,
          last_name: client_admin.user.last_name,
          grant_names: {
            clients: %w[view view_licenses]
          },
          admin_role_ids: [admin_role.id]
        }
      )

      patch "/api/v2/administration/memberships/#{client_admin.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      membership_response = JSON.parse(response.body)['data']
      expect(membership_response).to have_key('id')
      expect(membership_response).to have_attribute(:first_name).with_value(user.first_name)
      expect(membership_response).to have_attribute(:last_name).with_value(user.last_name)
      expect(membership_response).to have_attribute(:email).with_value(user.email)
      expect(membership_response).to have_attribute(:admin_role_ids).with_value([admin_role.id])
    end
  end

  describe 'POST /memberships/export' do
    it 'Export admin members for client' do
      client_admin_membership = create(:client_admin_membership)
      body = jsonapi_resource_request(
        'memberships',
        {
          client_id: client_admin_membership.client_id
        }
      )

      post '/api/v2/administration/memberships/export',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('export_admin_with_permissions')
      expect(AdminJobRecord.last.data).to include({ 'client_id' => client_admin_membership.client_id })
    end

    it 'Export admin members for project' do
      project = create(:project)
      create(:project_admin, project: project)

      post '/api/v2/administration/memberships/export',
           params: {
             filter: { with_role: 'project_admin' },
             data: {
               attributes: {
                 project_id: project.id
               }
             }
           }.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('export_admin_with_permissions')
      expect(AdminJobRecord.last.data).to include({ 'project_id' => project.id })
    end

    it 'Export admin members for campaign' do
      campaign = create(:campaign)
      create(:campaign_admin, campaign: campaign)

      post '/api/v2/administration/memberships/export',
           params: {
             filter: { with_role: 'campaign_admin' },
             data: {
               attributes: {
                 campaign_id: campaign.id
               }
             }
           }.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('export_admin_with_permissions')
      expect(AdminJobRecord.last.data).to include({ 'campaign_id' => campaign.id })
    end
  end
  describe 'GET /memberships/{membership_id}/spoof' do
    it 'falls back to root-domain impersonation when client admin sso is disabled' do
      membership = create(:client_admin_membership)
      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(false)

      get "/api/v2/administration/memberships/#{membership.id}/spoof"

      expect(response).to have_http_status(:found)
      expect(response).to redirect_to('/admin/user_availabilities')
      expect(session[:impersonated_by_id]).to eq(superadmin.id)
    end
  end
end
