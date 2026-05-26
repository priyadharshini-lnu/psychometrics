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

  let(:mettl_valid_params) do
    {
      name: 'mettl',
      api_base_url: 'https://api.mettl.com',
      active: true,
      public_key: 'public_key',
      private_key: 'private_key'
    }
  end

  describe 'POST create' do
    context 'iiht integration' do
      it 'creates integrations if params are valid' do
        post :create, params: {
          project_id: project.id,
          resource: valid_params
        }, format: :json

        parsed_response = response.parsed_body
        integration = project.reload.integrations.iiht.first
        expected_response = {
          'id' => integration.id,
          'name' => 'iiht',
          'active' => true,
          'iiht_integration_details' => {
            'tenant_id' => 'tenant_id',
            'tenancy_name' => 'tenancy_name',
            'user' => 'user',
            'webhook_url' => webhooks_iiht_url(
              host: Settings.domain,
              subdomain: Settings.subdomain,
              protocol: Settings.protocol,
              port: Settings.port,
              project_id: project.id
            )
          },
          'hogan_integration_details' => nil,
          'mettl_integration_details' => nil,
          'skillvue_integration_details' => nil,
          'yoodli_integration_details' => nil,
          'microsite_integration_details' => nil
        }

        expect(response.status).to eq(200)
        expect(parsed_response).to eq(expected_response)
      end

      it "doesn't create params are not valid" do
        post :create, params: {
          project_id: project.id,
          resource: valid_params.merge(user: '')
        }, format: :json

        parsed_response = response.parsed_body
        expect(response.status).to eq(422)
        expect(parsed_response).to eq({ 'errors' => { 'user' => ["can't be blank"] } })
      end
    end

    context 'hogan integration' do
      let(:valid_params) do
        {
          name: 'hogan',
          active: true,
          provider: 'phoenix'
        }
      end

      it 'creates integrations if params are valid' do
        post :create, params: {
          project_id: project.id,
          resource: valid_params
        }, format: :json

        parsed_response = response.parsed_body
        integration = project.reload.integrations.hogan.first
        expected_response = {
          'id' => integration.id,
          'name' => 'hogan',
          'active' => true,
          'hogan_integration_details' => { 'provider' => 'phoenix' },
          'iiht_integration_details' => nil,
          'mettl_integration_details' => nil,
          'skillvue_integration_details' => nil,
          'yoodli_integration_details' => nil,
          'microsite_integration_details' => nil
        }

        expect(response.status).to eq(200)
        expect(parsed_response).to eq(expected_response)
      end

      it "doesn't create params are not valid" do
        post :create, params: {
          project_id: project.id,
          resource: valid_params.merge(provider: '')
        }, format: :json

        parsed_response = response.parsed_body
        expect(response.status).to eq(422)
        expect(parsed_response).to eq({ 'errors' => { 'provider' => ["can't be blank"] } })
      end
    end

    context 'skillvue integration' do
      let(:skillvue_valid_params) do
        {
          name: 'skillvue',
          api_key: 'some_api_key',
          active: true
        }
      end

      it 'creates integration if params are valid' do
        expect do
          post :create, params: {
            project_id: project.id,
            resource: skillvue_valid_params
          }, format: :json
        end.to change { Integration.where(project_id: project.id, name: 'skillvue').count }.by(1)

        integration = project.reload.integrations.find_by(name: 'skillvue')
        expect(integration).not_to be_nil
        expect(integration.skillvue_config['api_key']).to eq(skillvue_valid_params[:api_key])
        expect(integration.name).to eq('skillvue')
        expect(integration.active).to be(true)

        parsed_response = response.parsed_body
        expected_response = {
          'id' => integration.id,
          'name' => 'skillvue',
          'active' => true,
          'skillvue_integration_details' => {
            'api_key' => '********_key',
            'completion_webhook_url' => nil,
            'results_webhook_url' => nil
          },
          'hogan_integration_details' => nil,
          'iiht_integration_details' => nil,
          'mettl_integration_details' => nil,
          'yoodli_integration_details' => nil,
          'microsite_integration_details' => nil
        }

        expect(response.status).to eq(200)
        expect(parsed_response).to eq(expected_response)
      end

      it "doesn't create integration if params are not valid" do
        post :create, params: {
          project_id: project.id,
          resource: skillvue_valid_params.merge(api_key: '')
        }, format: :json

        parsed_response = response.parsed_body
        expect(response.status).to eq(422)
        expect(parsed_response).to eq({ 'errors' => { 'api_key' => ["can't be blank"] } })
      end
    end
  end

  context 'yoodli integration' do
    let(:yoodli_valid_params) do
      {
        name: 'yoodli',
        launch_url: 'https://keys.example/.well-known/jwks.json',
        login_url: 'https://auth.example/token',
        keyset_url: 'https://auth.example/auth',
        active: true
      }
    end

    it 'creates integration if params are valid' do
      expect do
        post :create, params: {
          project_id: project.id,
          resource: yoodli_valid_params
        }, format: :json
      end.to change { Integration.where(project_id: project.id, name: 'yoodli').count }.by(1)

      integration = project.reload.integrations.find_by(name: 'yoodli')
      expect(integration).not_to be_nil
      expect(integration.config['launch_url']).to eq(yoodli_valid_params[:launch_url])
      expect(integration.config['login_url']).to eq(yoodli_valid_params[:login_url])
      expect(integration.config['keyset_url']).to eq(yoodli_valid_params[:keyset_url])
      expect(integration.active).to be(true)

      parsed_response = response.parsed_body
      expected_response = {
        'id' => integration.id,
        'name' => 'yoodli',
        'active' => true,
        'yoodli_integration_details' => {
          'platform_id' =>
            Utility::Url.generate(:root_url, subdomain: integration.project.subdomain).chomp('/'),
          'client_id' => integration.project.id,
          'deployment_id' => integration.id,
          'platform_public_keyset_url' =>
            Utility::Url.generate(:lti_jwks_url, subdomain: integration.project.subdomain),
          'platform_access_token_url' =>
            Utility::Url.generate(:lti_oauth2_token_url, subdomain: integration.project.subdomain),
          'platform_authentication_request_url' =>
            Utility::Url.generate(:lti_auth_url, subdomain: integration.project.subdomain),
          'platform_host_name' =>
            Utility::Url.generate(:root_url, subdomain: integration.project.subdomain).
                          chomp('/').
                          sub(%r{^https?://}, ''),
          'launch_url' => yoodli_valid_params[:launch_url],
          'login_url' => yoodli_valid_params[:login_url],
          'keyset_url' => yoodli_valid_params[:keyset_url]
        },
        'hogan_integration_details' => nil,
        'iiht_integration_details' => nil,
        'mettl_integration_details' => nil,
        'skillvue_integration_details' => nil,
        'microsite_integration_details' => nil
      }

      expect(response.status).to eq(200)
      expect(parsed_response).to eq(expected_response)
    end

    it "doesn't create integration if params are not valid" do
      post :create, params: {
        project_id: project.id,
        resource: yoodli_valid_params.merge(launch_url: '')
      }, format: :json

      parsed_response = response.parsed_body
      expect(response.status).to eq(422)
      expect(parsed_response).to eq(
        { 'errors' => { 'launch_url' => [
          'can\'t be blank',
          'Invalid URL. Specify the complete url with http or https protocol in it.'
        ] } }
      )
    end
  end

  describe 'POST create' do
    context 'mettl integration' do
      it 'creates integration if params are valid' do
        expect do
          post :create, params: {
            project_id: project.id,
            resource: mettl_valid_params
          }, format: :json
        end.to change { Integration.where(project_id: project.id, name: 'mettl').count }.by(1)

        integration = project.reload.integrations.find_by(name: 'mettl')
        expect(integration).not_to be_nil
        expect(integration.mettl_config['api_base_url']).to eq('https://api.mettl.com')
        expect(integration.mettl_config['public_key']).to eq('public_key')
        expect(integration.mettl_config['private_key']).to eq('private_key')
        expect(integration.active).to be(true)

        parsed_response = response.parsed_body
        expected_response = {
          'id' => integration.id,
          'name' => 'mettl',
          'active' => true,
          'mettl_integration_details' => {
            'api_base_url' => 'https://api.mettl.com',
            'public_key' => 'public_key',
            'private_key' => '*******_key',
            'completion_webhook_url' => webhooks_mettl_completion_notification_url(
              host: Settings.domain,
              subdomain: Settings.subdomain,
              protocol: Settings.protocol,
              port: Settings.port,
              project_id: project.id
            ),
            'results_webhook_url' => webhooks_mettl_results_notification_url(
              host: Settings.domain,
              subdomain: Settings.subdomain,
              protocol: Settings.protocol,
              port: Settings.port,
              project_id: project.id
            )
          },
          'hogan_integration_details' => nil,
          'iiht_integration_details' => nil,
          'skillvue_integration_details' => nil,
          'yoodli_integration_details' => nil,
          'microsite_integration_details' => nil
        }

        expect(response.status).to eq(200)
        expect(parsed_response).to eq(expected_response)
      end

      it "doesn't create integration if params are not valid" do
        post :create, params: {
          project_id: project.id,
          resource: mettl_valid_params.merge(public_key: '')
        }, format: :json

        parsed_response = response.parsed_body
        expect(response.status).to eq(422)
        expect(parsed_response).to eq({ 'errors' => { 'public_key' => ["can't be blank"] } })
      end

      it "doesn't create integration if name is not unique" do
        create(:integration, :mettl_integration, project: project)

        post :create, params: {
          project_id: project.id,
          resource: mettl_valid_params
        }, format: :json

        parsed_response = response.parsed_body
        expect(response.status).to eq(422)
        expect(parsed_response).to eq(
          { 'errors' => { 'name' => ['This integration is already present for this project'] } }
        )
      end
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

      parsed_response = response.parsed_body

      expect(response.status).to eq(200)
      expect(parsed_response['iiht_integration_details']['tenant_id']).to eq(update_tenant_id)
      expect(integration.reload.config['tenant_id']).to eq(update_tenant_id)
    end

    it "doesn't update integration if params are not valid" do
      update_tenant_id = '12'
      put :update, params: {
        project_id: project.id,
        id: integration.id,
        resource: valid_params.merge(tenant_id: update_tenant_id, tenancy_name: '')
      }, format: :json

      parsed_response = response.parsed_body
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
