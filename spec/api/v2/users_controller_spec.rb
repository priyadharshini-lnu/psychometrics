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
                toggle_enable_2fa: true
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
                'toggle_enable_2fa' => true
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
end
