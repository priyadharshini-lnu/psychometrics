# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::UsersController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/users/' do
    get 'User List' do
      operationId 'UserList'
      description <<~HEREDOC
        Fetch User List

        **Supported Filter Query Parameter**

        | Filter        | Description   |
        | ------------- |:-------------:|
        | filter[with_access_to_campaign]     | Returns admins who have access to the specific campaign_id passed as filter value |
        | filter[search_query]     | Returns user who have name or email matches passed as filter value |
        | filter[admin]     | Returns only admin users |
      HEREDOC
      tags 'User'
      consumes 'application/json'
      security [basic: []]
      parameter name: :include_resource_meta, in: :query, required: true
      parameter name: :'filter[role_eq]', in: :query, required: true

      response '200', 'User list' do
        let!(:user) { create(:client_admin) }
        let!(:include_resource_meta) { 'permissions' }
        let(:'filter[role_eq]') { 'Users::Admin' }

        schema '$ref' => '#/components/schemas/UserListResponse'

        examples 'application/json' => [{
          type: 'users',
          data: {
            id: '770',
            attributes: {
              name: 'User Name',
              email: 'user@cc.com'
            },
            meta: {
              permissions: {
                remove: false,
                reset_password: true,
                toggle_enable_2fa: true,
                login_as: true,
                unlock_user_access: false
              }
            }
          }
        }]

        run_test! do |response|
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
    end

    describe 'Ignoring Swagger' do
      before(:each) { login_user(superadmin) }
      after(:each) { sign_out(superadmin) }
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
        before(:each) { login_user(superadmin) }
        after(:each) { sign_out(superadmin) }
        it 'check response' do
          get "/api/v2/administration/users/#{superadmin.id}/roles", params: { user_id: superadmin.id }
          parsed_response = JSON.parse(response.body)
          expect(parsed_response['data']['attributes']).to eq(
            { 'roles' => [{ 'name' => 'superadmin', 'paths' => [] }] }
          )
        end
      end

      describe 'Get current user details' do
        before(:each) { login_user(superadmin) }
        after(:each) { sign_out(superadmin) }
        it 'check response' do
          get '/api/v2/administration/users/current_user_details'
          parsed_response = JSON.parse(response.body)['data']
          expect(parsed_response['id']).to eq(superadmin.id.to_s)
          expect(parsed_response['attributes']['email']).to eq(superadmin.email)
          expect(parsed_response['attributes']['first_name']).to eq(superadmin.first_name)
          expect(parsed_response['attributes']['last_name']).to eq(superadmin.last_name)
          expect(parsed_response['attributes']['navigation_links']['links']).to eq(
            {
              'profileDetails' => '/admin/profile/details',
              'profile' => '/admin/profile',
              'changePassword' => '/admin/profile/change_password',
              'clients' => '/admin/clients',
              'skills' => '/admin/skills',
              'developmentActions' => '/admin/development_actions',
              'users' => '/admin/users',
              'norms' => '/administration/norms',
              'dataReports' => '/admin/data_reports',
              'dimensions' => '/administration/dimensions',
              'assessments' => '/admin/assessments',
              'userAvailability' => '/admin/user_availabilities',
              'questionCenter' => '/administration/templates/questions',
              'libraries' => '/administration/libraries',
              'communicationCenter' => '/administration/communications',
              'reports' => '/admin/reports',
              'reportApprovals' => '/admin/report_approvals/my_tasks',
              'campaignTemplates' => '/admin/campaign_templates',
              'auditLogs' => '/admin/audit_logs'
            }
          )
        end
      end
    end
  end

  path '/users/{user_id}/reset_password/' do
    let(:user) { create(:client_admin) }
    let(:new_password) { user.generate_strong_password }
    let(:user_id) { user.id }

    post 'Reset Password' do
      operationId 'ResetPassword'
      description 'Reset Password'
      tags 'User'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ResetPasswordRequest' },
                required: true

      response '200', 'Password Reset' do
        schema '$ref' => '#/components/schemas/ResetPasswordResponse'

        examples 'application/json' => {
          type: 'users',
          data: {
            id: '770',
            attributes: {
              automatically_generate_password: false,
              password: 'strong_password1',
              change_password_on_login: true,
              send_password_email: true
            }
          }
        }

        let(:body) do
          jsonapi_resource_request(
            'users',
            {
              automatically_generate_password: false,
              password: new_password,
              change_password_on_login: true,
              send_password_email: true
            }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:password)
          expect(user.reload.force_password_change).to eq(true)
          expect(user.reload.valid_password?(new_password)).to eq(true)
        end
      end
    end
  end

  path '/users/{user_id}/unlock_user_access' do
    let(:user) { create(:user, :locked) }
    let(:user_id) { user.id }

    post 'Unlock User Access' do
      operationId 'UnlockUserAccess'
      description 'Unlock User Access'
      tags 'User'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_id, in: :path, type: :string

      response '200', 'User Access Unlocked' do
        examples 'application/json' => {
          type: 'users',
          data: { id: '770' }
        }

        run_test! do
          user.reload
          expect(user.locked_at).to be_nil
          expect(user.failed_attempts).to eq(0)
          expect(user.unlock_token).to be_nil
        end
      end
    end
  end

  path '/users/create_global_assessor' do
    post 'Create Global Assessor' do
      operationId 'CreateGlobalAssessor'
      description 'Create Global Assessor'
      tags 'User'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserResponse' },
                required: true

      response '200', 'Global Assessor Created' do
        schema '$ref' => '#/components/schemas/UserCreateRequest'

        examples 'application/json' => {
          type: 'users',
          data: {
            id: '770',
            attributes: {
              email: 'random@gmail.com',
              first_name: 'John',
              last_name: 'Doe'
            }
          }
        }

        let(:body) do
          jsonapi_resource_request(
            'users',
            {
              email: Faker::Internet.email,
              first_name: Faker::Name.first_name,
              last_name: Faker::Name.last_name
            }
          )
        end

        run_test! do |response|
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
    end
  end

  path '/users/change_password/' do
    let(:current_password) { superadmin.password }
    let(:new_password) { 'NewPassword@129' }

    before(:each) { login_user(superadmin) }
    after(:each) { sign_out(superadmin) }

    post 'Change Password' do
      operationId 'ChangePassword'
      description 'Change Password'
      tags 'User'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ChangePasswordRequest' },
                required: true

      response '200', 'Change Password' do
        schema '$ref' => '#/components/schemas/ChangePasswordResponse'

        examples 'application/json' => {
          type: 'users',
          data: {
            id: '770',
            attributes: {
              current_password: 'Password@916',
              password: 'Password@916',
              password_confirmation: 'Password@916'
            }
          }
        }

        let(:body) do
          jsonapi_resource_request(
            'users',
            {
              current_password: current_password,
              password: new_password,
              password_confirmation: new_password
            }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_attribute(:message)
          superadmin.reload.valid_password?(new_password)
        end
      end
    end
  end

  path '/users/{user_id}' do
    patch 'Update a user' do
      operationId 'UpdateUser'
      description 'Update a User'
      tags 'User'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserResponse' }, required: true
      parameter name: :include, in: :query, type: :string

      response '200', 'User Updated' do
        schema '$ref' => '#/components/schemas/UserUpdateRequest'
        examples 'application/json' => {
          type: 'users',
          data: {
            type: 'users',
            id: '34861',
            attributes: {
              first_name: 'John',
              last_name: 'Doe',
              user_profile_data: {
                locale: 'en',
                timezone: 'Asia/Calcutta'
              }
            }
          }
        }

        let(:user) { create(:client_admin) }
        let(:user_id) { user.id }
        let(:updated_attributes) do
          {
            first_name: 'John',
            last_name: 'Doe',
            user_profile_data: {
              locale: 'en',
              timezone: 'Asia/Calcutta'
            }
          }
        end

        let(:body) do
          {
            data: {
              type: 'users',
              id: user.id.to_s,
              attributes: updated_attributes
            }
          }
        end
        let(:include) { 'user_profile' }

        run_test! do |response|
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
  end
end
