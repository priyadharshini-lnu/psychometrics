# frozen_string_literal: true

require 'rails_helper'

describe Administration::Projects::IntegrationsController, type: :controller do
  include Rails.application.routes.url_helpers

  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }
  let(:valid_params) do
    {
      name: 'iiht',
      active: true,
      tenant_id: 'tenant_id',
      tenancy_name: 'tenancy_name',
      user: 'user',
      password: 'password'
    }
  end

  describe 'POST create' do
    it 'creates integrations if params are valid' do
      post :create, params: {
        project_id: project.id,
        resource: valid_params
      }, format: :json

      parsed_response = JSON.parse(response.body)
      integration = project.reload.integrations.iiht.first
      expected_response = integration.attributes.slice('id', 'name', 'active').merge(
        integration.config.except('password')
      ).merge(
        'details' => {
          'webhook_url' => webhooks_iiht_url(
            host: Settings.domain,
            subdomain: Settings.subdomain,
            protocol: Settings.protocol,
            port: Settings.port,
            project_id: project.id
          )
        }
      )

      expect(response.status).to eq(200)
      expect(parsed_response).to eq(expected_response)
    end

    it "doesn't create params are not valid" do
      post :create, params: {
        project_id: project.id,
        resource: valid_params.merge(user: '')
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(422)
      expect(parsed_response).to eq({ 'errors' => { 'user' => ["can't be blank"] } })
    end
  end

  describe 'PUT update' do
    let(:integration) do
      create(:integration, project: project, name: :iiht, config: valid_params.except(:name, :active))
    end

    it 'updates integrations if params are valid' do
      update_tenant_id = '12'
      put :update, params: {
        project_id: project.id,
        id: integration.id,
        resource: valid_params.merge(tenant_id: update_tenant_id)
      }, format: :json

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response['tenant_id']).to eq(update_tenant_id)
      expect(integration.reload.config['tenant_id']).to eq(update_tenant_id)
    end

    it "doesn't update integration if params are not valid" do
      update_tenant_id = '12'
      put :update, params: {
        project_id: project.id,
        id: integration.id,
        resource: valid_params.merge(tenant_id: update_tenant_id, tenancy_name: '')
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(422)
      expect(parsed_response).to eq({ 'errors' => { 'tenancy_name' => ["can't be blank"] } })
    end
  end

  describe 'DELETE destroy' do
    it 'deletes integration' do
      integration = create(:integration, project: project)

      expect do
        delete :destroy, params: {
          project_id: project.id,
          id: integration.id
        }
      end.to change(Integration, :count).by(-1)
      expect(response.body).to eq(integration.id.to_s)
    end
  end
end
