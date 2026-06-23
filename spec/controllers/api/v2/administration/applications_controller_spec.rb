# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ApplicationsController, type: :controller do
  let(:tenant) { create(:tenancy) }
  let(:superadmin) { create(:superadmin) }
  let!(:application_user) { create(:application_user, tenant: tenant) }

  before do
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  describe 'GET #index' do
    it 'returns success status' do
      get :index, params: { client_id: tenant.id, query: { tenant_id: tenant.id } }
      expect(response).to have_http_status(:ok)
    end

    it 'returns only application users for the given tenant' do
      other_tenant = create(:tenancy)
      create(:application_user, tenant: other_tenant)

      get :index, params: { client_id: tenant.id, query: { tenant_id: tenant.id } }
      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody

      ids = json_response['data'].map { |d| d['id'].to_i }
      expect(ids).to include(application_user.id)
      expect(ids.count).to eq(1)
    end
  end

  describe 'GET #show' do
    it 'returns success status' do
      get :show, params: { client_id: tenant.id, query: { tenant_id: tenant.id }, id: application_user.id }
      expect(response).to have_http_status(:ok)
    end

    it 'returns the application user data' do
      get :show, params: { client_id: tenant.id, query: { tenant_id: tenant.id }, id: application_user.id }
      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody

      expect(json_response['data']['id']).to eq(application_user.id.to_s)
      expect(json_response['data']['type']).to eq('applications')
    end
  end

  describe 'POST #create' do
    let(:create_params) do
      {
        client_id: tenant.id,
        query: { tenant_id: tenant.id },
        data: {
          type: 'applications',
          attributes: { name: 'New Integration' }
        }
      }
    end

    it 'creates a new application user' do
      expect do
        post :create, params: create_params
      end.to change(Users::Application, :count).by(1)
    end

    it 'returns created status' do
      post :create, params: create_params
      expect(response).to have_http_status(:created)
    end

    it 'creates a client_admin membership for the new application user' do
      expect do
        post :create, params: create_params
      end.to change(Membership, :count).by(1)

      membership = Membership.last
      expect(membership.client_id).to eq(tenant.id)
      expect(membership.role).to eq(Membership::CLIENT_ADMIN_ROLE)
    end

    it 'generates the email from the name and tenant' do
      post :create, params: create_params
      created_user = Users::Application.last
      expect(created_user.email).to eq("new-integration.#{tenant.id}@app.com")
    end
  end

  describe 'POST #activate' do
    let!(:inactive_application_user) { create(:application_user, tenant: tenant, disabled: true) }

    it 'activates the application user' do
      post :activate, params: { client_id: tenant.id, id: inactive_application_user.id }
      expect(inactive_application_user.reload.disabled).to be false
    end

    it 'returns success status' do
      post :activate, params: { client_id: tenant.id, id: inactive_application_user.id }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST #deactivate' do
    it 'deactivates the application user' do
      post :deactivate, params: { client_id: tenant.id, id: application_user.id }
      expect(application_user.reload.disabled).to be true
    end

    it 'returns success status' do
      post :deactivate, params: { client_id: tenant.id, id: application_user.id }
      expect(response).to have_http_status(:ok)
    end
  end
end
