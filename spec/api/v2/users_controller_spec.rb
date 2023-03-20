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

      response '200', 'User list' do
        let!(:user) { create(:user) }

        schema '$ref' => '#/components/schemas/UserListResponse'

        examples 'application/json' => [{
          type: 'users',
          data: {
            id: '770',
            attributes: {
              name: 'User Name',
              email: 'user@cc.com'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          user_response = data.find { |d| d['id'] == user.id.to_s }
          expect(user_response).to have_key('id')
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
end
