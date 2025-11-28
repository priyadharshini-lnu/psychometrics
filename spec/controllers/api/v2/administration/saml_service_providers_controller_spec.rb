# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SamlServiceProvidersController, type: :controller do
  let(:project) { create(:project) }
  let(:client_admin) { create(:client_admin, client: project.client) }
  let!(:saml_service_provider) { create(:saml_service_provider, project: project) }

  describe 'GET #index' do
    before do
      sign_in client_admin
    end

    it 'returns success status' do
      get :index, params: { project_id: project.id }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST #create' do
    let(:json_payload) do
      {
        data: {
          type: 'saml_service_providers',
          attributes: {
            name: 'New Test Provider',
            entity_id: 'http://newtest.example.com/saml/metadata',
            acs_urls: ['http://newtest.example.com/saml/acs'],
            enabled: true,
            mask_identity: false
          }
        }
      }.to_json
    end

    before do
      sign_in client_admin
      request.headers['Content-Type'] = 'application/vnd.api+json'
    end

    it 'creates a new saml service provider' do
      expect do
        post :create, params: JSON.parse(json_payload).merge(project_id: project.id)
      end.to change(SamlServiceProvider, :count).by(1)
    end

    it 'returns created status' do
      post :create, params: JSON.parse(json_payload).merge(project_id: project.id)
      expect(response).to have_http_status(:created)
    end

    it 'returns the created object in response' do
      post :create, params: JSON.parse(json_payload).merge(project_id: project.id)
      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody

      expect(json_response).to have_key('data')
      expect(json_response['data']['type']).to eq('saml_service_providers')
      expect(json_response['data']['attributes']['name']).to eq('New Test Provider')
      expect(json_response['data']['attributes']['entity_id']).to eq('http://newtest.example.com/saml/metadata')
      expect(json_response['data']['attributes']['mask_identity']).to eq(false)
      expect(json_response['data']['attributes']['enabled']).to eq(true)
    end

    it 'associates the provider with the correct project' do
      post :create, params: JSON.parse(json_payload).merge(project_id: project.id)
      created_provider = SamlServiceProvider.last
      expect(created_provider.project_id).to eq(project.id)
      expect(created_provider.name).to eq('New Test Provider')
      expect(created_provider.mask_identity).to eq(false)
    end
  end

  describe 'PATCH #update' do
    let(:json_update_payload) do
      {
        data: {
          type: 'saml_service_providers',
          id: saml_service_provider.id.to_s,
          attributes: {
            name: 'Updated Test Provider',
            entity_id: saml_service_provider.entity_id,
            acs_urls: saml_service_provider.acs_urls,
            mask_identity: true,
            enabled: false
          }
        }
      }.to_json
    end

    before do
      sign_in client_admin
      request.headers['Content-Type'] = 'application/vnd.api+json'
    end

    it 'updates the saml service provider' do
      patch :update, params: JSON.parse(json_update_payload).merge(project_id: project.id, id: saml_service_provider.id)
      saml_service_provider.reload
      expect(saml_service_provider.name).to eq('Updated Test Provider')
      expect(saml_service_provider.mask_identity).to eq(true)
      expect(saml_service_provider.enabled).to eq(false)
    end

    it 'returns success status' do
      patch :update, params: JSON.parse(json_update_payload).merge(project_id: project.id, id: saml_service_provider.id)
      expect(response).to have_http_status(:ok)
    end

    it 'returns the updated object in response' do
      patch :update, params: JSON.parse(json_update_payload).merge(project_id: project.id, id: saml_service_provider.id)
      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody

      expect(json_response).to have_key('data')
      expect(json_response['data']['type']).to eq('saml_service_providers')
      expect(json_response['data']['attributes']['name']).to eq('Updated Test Provider')
      expect(json_response['data']['attributes']['mask_identity']).to eq(true)
      expect(json_response['data']['attributes']['enabled']).to eq(false)
    end
  end

  describe 'POST #rotate_certificate' do
    before do
      sign_in client_admin
    end

    it 'rotates the certificate for the saml service provider' do
      original_certificate = saml_service_provider.idp_certificate
      post :rotate_certificate, params: { project_id: project.id, id: saml_service_provider.id }
      saml_service_provider.reload
      expect(saml_service_provider.idp_certificate).not_to eq(original_certificate)
    end

    it 'returns success status' do
      post :rotate_certificate, params: { project_id: project.id, id: saml_service_provider.id }
      expect(response).to have_http_status(:ok)
    end

    it 'returns the updated object in response' do
      post :rotate_certificate, params: { project_id: project.id, id: saml_service_provider.id }
      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody

      expect(json_response).to have_key('data')
      expect(json_response['data']['type']).to eq('saml_service_providers')
      expect(json_response['data']['id']).to eq(saml_service_provider.id.to_s)
    end
  end

  describe 'DELETE #destroy' do
    let!(:saml_service_provider_to_delete) { create(:saml_service_provider, project: project) }

    before do
      sign_in client_admin
    end

    it 'destroys the saml service provider' do
      expect do
        delete :destroy, params: { project_id: project.id, id: saml_service_provider_to_delete.id }
      end.to change(SamlServiceProvider, :count).by(-1)
    end

    it 'returns no content status' do
      delete :destroy, params: { project_id: project.id, id: saml_service_provider_to_delete.id }
      expect(response).to have_http_status(:no_content)
    end
  end
end
