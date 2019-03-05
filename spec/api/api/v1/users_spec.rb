require 'rails_helper'
require 'rails_helper'
require 'swagger_helper'

describe 'Users' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, parent: project) }
  let(:user) { create(:user, project: project) }
  before { create(:api_key, token: 'token', user: membership.user) }
  let(:'X-Api-Key') { "token" }
  path '/api/v1/projects/{project_id}/users' do

    post 'Adds a new user to the project' do
      tags 'Users'
      consumes 'application/json'
      security [apiKey: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/NewUser' }, required: true

      response '200', 'User created' do
        schema '$ref' => '#/definitions/User'
        examples 'application/json' => {
          "id":           14602,
          "first_name":   "Kamaru",
          "last_name":    "Usman",
          "email":        "marti@gmail.com",
          "created_at":   "2019-03-04T15:47:33.570+04:00",
          "updated_at":   "2019-03-04T15:47:33.950+04:00",
          "campaign_ids": [
            510
          ]
        }

        let(:first_name) { 'Max' }
        let(:last_name) { 'Holloway' }
        let(:email) { 'max@example.com' }
        let(:campaign_ids) { [campaign.id] }
        let(:project_id) { project.id }
        let(:body) { { email: email, first_name: first_name, last_name: last_name, campaign_ids: campaign_ids } }

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user['id']).to be
          expect(user['first_name']).to eq first_name
          expect(user['last_name']).to eq last_name
          expect(user['email']).to eq email
          expect(user['campaign_ids']).to eq [campaign.id]
        end
      end
    end
  end

  path '/api/v1/projects/{project_id}/users/{user_id}' do

    put 'Updates user details' do
      tags 'Users'
      consumes 'application/json'
      security [apiKey: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedUser' }, required: true

      response '200', 'Update the user' do
        schema '$ref' => '#/definitions/User'
        examples 'application/json' => {
          "id":           14602,
          "first_name":   "Kamaru",
          "last_name":    "Usman",
          "email":        "marti@gmail.com",
          "created_at":   "2019-03-04T15:47:33.570+04:00",
          "updated_at":   "2019-03-04T15:47:33.950+04:00",
          "campaign_ids": [
            510
          ]
        }

        let(:first_name) { 'Brian' }
        let(:last_name) { 'Ortega' }
        let(:email) { 'ortega@example.com' }
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:body) { { email: email, first_name: first_name, last_name: last_name } }

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user['first_name']).to eq first_name
          expect(user['last_name']).to eq last_name
          expect(user['email']).to eq email
        end
      end
    end
  end
end
