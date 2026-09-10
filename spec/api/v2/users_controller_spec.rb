# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UsersController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/users' do
    it 'fetches User List' do
      user = create(:client_admin)

      get '/api/v2/administration/users',
          params: { include_resource_meta: 'permissions', 'filter[role_eq]' => 'Users::Admin' },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      user_response = data.find { |d| d['id'] == user.id.to_s }
      expect(user_response).to have_key('id')
      expect(user_response).to have_meta(
        {
          'permissions' => {
            'reset_password' => true,
            'remove' => true,
            'toggle_enable_2fa' => true,
            'login_as' => true,
            'unlock_user_access' => false
          }
        }
      )
      expect(user_response).to have_attribute(:name).with_value(user.decorate.display_name)
      expect(user_response).to have_attribute(:email).with_value(user.email)
    end
  end

  describe 'Ignoring Swagger' do
    describe 'Create a Superadmin' do
      it 'check success response' do
        post '/api/v2/administration/users/create_superadmin', params: {
          data: {
            type: 'users',
            attributes: {
              email: 'a@a.com',
              first_name: 'John',
              last_name: 'Travolta'
            }
          }
        }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(200)
        expect(parsed_response['data']).to have_key('attributes')
        expect(parsed_response.dig('data', 'attributes', 'email')).to eq('a@a.com')
        expect(parsed_response.dig('data', 'attributes', 'first_name')).to eq('John')
        expect(parsed_response.dig('data', 'attributes', 'last_name')).to eq('Travolta')
      end

      it 'check invalid response' do
        post '/api/v2/administration/users/create_superadmin', params: {
          data: {
            type: 'users',
            attributes: {
              email: 'a',
              first_name: 'John',
              last_name: 'Travolta'
            }
          }
        }

        expect(response.status).to eq(422)
      end
    end

    describe 'Get roles' do
      it 'check response' do
        get "/api/v2/administration/users/#{superadmin.id}/roles", params: { user_id: superadmin.id }
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['data']['attributes']).to eq(
          { 'roles' => [{ 'name' => 'superadmin', 'paths' => [] }] }
        )
      end
    end

    describe 'Get current user details' do
      it 'serializes the user preferences' do
        create(:user_preference, user: superadmin, category: 'theme', config_key: 'appearance',
                                 payload: { 'mode' => 'dark' })

        get '/api/v2/administration/users/current_user_details'

        preferences = JSON.parse(response.body)['data']['attributes']['preferences']
        expect(preferences).to include(
          'category' => 'theme', 'config_key' => 'appearance', 'payload' => { 'mode' => 'dark' },
          'resource_type' => nil, 'resource_id' => nil
        )
      end

      it 'check response' do
        allow(Settings.features).to receive(:[]).with(:ai_assistant_enabled).and_return(true)
        allow(Settings.features).to receive(:dimensions_react_ui).and_return(true)
        allow(Settings.features).to receive(:libraries_react_ui).and_return(true)
        allow(Settings.features).to receive(:question_center_react_ui).and_return(true)
        allow(Settings.features).to receive(:communication_center_enabled).and_return(true)
        get '/api/v2/administration/users/current_user_details'
        parsed_response = JSON.parse(response.body)['data']
        expect(parsed_response['id']).to eq(superadmin.id.to_s)
        expect(parsed_response['attributes']['email']).to eq(superadmin.email)
        expect(parsed_response['attributes']['first_name']).to eq(superadmin.first_name)
        expect(parsed_response['attributes']['last_name']).to eq(superadmin.last_name)
        expect(parsed_response['attributes']['navigation_links']['links']).to eq(
          {
            'aiAssistants' => '/admin/ai_assistants',
            'aiScoringApprovals' => '/admin/ai_scoring_approvals',
            'assessments' => '/admin/assessments',
            'auditLogs' => '/admin/audit_logs',
            'campaignTemplates' => '/admin/campaign_templates',
            'changePassword' => '/admin/profile/change_password',
            'clients' => '/admin/clients',
            'communicationCenter' => '/administration/communications',
            'dataReports' => '/admin/data_reports',
            'developmentActions' => '/admin/development_actions',
            'dimensions' => '/admin/dimensions',
            'libraries' => '/admin/libraries',
            'newCommunicationCenter' => '/admin/communication_center',
            'settings' => '/admin/settings',
            'norms' => '/admin/norms',
            'profile' => '/admin/profile',
            'profileDetails' => '/admin/profile/details',
            'questionCenter' => '/admin/templates/questions',
            'reportApprovals' => '/admin/report_approvals/my_tasks',
            'reports' => '/admin/reports',
            'skillsTaxonomy' => '/admin/skills_taxonomy',
            'userAvailability' => '/admin/user_availabilities',
            'users' => '/admin/users'
          }
        )
      end
    end
  end

  describe 'POST /api/v2/administration/users/:user_id/reset_password' do
    it 'resets password' do
      user = create(:client_admin)
      new_password = user.generate_strong_password

      body = jsonapi_resource_request(
        'users',
        {
          automatically_generate_password: false,
          password: new_password,
          change_password_on_login: true,
          send_password_email: true
        }
      )

      post "/api/v2/administration/users/#{user.id}/reset_password",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:password)
      expect(user.reload.force_password_change).to eq(true)
      expect(user.reload.valid_password?(new_password)).to eq(true)
    end
  end

  describe 'POST /api/v2/administration/users/:user_id/unlock_user_access' do
    it 'unlocks user access' do
      user = create(:user, :locked)

      post "/api/v2/administration/users/#{user.id}/unlock_user_access",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      user.reload
      expect(user.locked_at).to be_nil
      expect(user.failed_attempts).to eq(0)
      expect(user.unlock_token).to be_nil
    end
  end

  describe 'POST /api/v2/administration/users/create_global_assessor' do
    it 'creates Global Assessor' do
      body = jsonapi_resource_request(
        'users',
        {
          email: Faker::Internet.email,
          first_name: Faker::Name.first_name,
          last_name: Faker::Name.last_name
        }
      )

      post '/api/v2/administration/users/create_global_assessor',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:email)
      expect(data).to have_attribute(:first_name)
      expect(data).to have_attribute(:last_name)
      user = User.find_by(email: data['attributes']['email'])
      expect(user).to eq(User.last)
      expect(user.global_assessor).to eq(true)
    end
  end

  describe 'POST /api/v2/administration/users/change_password' do
    it 'changes password' do
      current_password = superadmin.password
      new_password = 'NewPassword@129'

      body = jsonapi_resource_request(
        'users',
        {
          current_password: current_password,
          password: new_password,
          password_confirmation: new_password
        }
      )

      post '/api/v2/administration/users/change_password',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_attribute(:message)
      superadmin.reload.valid_password?(new_password)
    end
  end

  describe 'PATCH /api/v2/administration/users/:user_id' do
    it 'updates user' do
      user = create(:client_admin)
      updated_attributes = {
        first_name: 'John',
        last_name: 'Doe',
        user_profile_data: {
          locale: 'en',
          timezone: 'Asia/Kolkata'
        }
      }

      body = {
        data: {
          type: 'users',
          id: user.id.to_s,
          attributes: updated_attributes
        }
      }

      patch "/api/v2/administration/users/#{user.id}?include=user_profile",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      user_response = JSON.parse(response.body)['data']
      user_profile = JSON.parse(response.body)['included'].first
      expect(user_response).to have_key('id')
      expect(user_response).to have_attribute(:first_name).with_value(updated_attributes[:first_name])
      expect(user_response).to have_attribute(:last_name).with_value(updated_attributes[:last_name])
      expect(user_profile).to have_attribute(:locale).with_value(updated_attributes[:user_profile_data][:locale])
      expect(user_profile).to have_attribute(:timezone).
        with_value(updated_attributes[:user_profile_data][:timezone])
    end
  end
end
