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
  end
end
