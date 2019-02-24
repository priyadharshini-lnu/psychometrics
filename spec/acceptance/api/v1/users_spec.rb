require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Add / update users'
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, parent: project) }
  let(:user) { create(:user, project: project) }
  before { create(:api_key, token: 'token', user: membership.user) }
  authentication :apiKey, 'token', name: "X-Api-Key"

  post "/api/v1/projects/:project_id/users" do
    route_summary 'Adds a new user to the project'

    with_options scope: :user, with_example: true do
      parameter :first_name, 'First Name of new user'
      parameter :last_name, 'Last Name of new user'
      parameter :email, 'Email of new user', required: true
      parameter :password, 'Password for new user', required: true
      parameter :campaign_ids, 'Array of campaign ids'
    end

    let(:first_name) { 'Max' }
    let(:last_name) { 'Holloway' }
    let(:email) { 'max@example.com' }
    let(:password) { 'password' }
    let(:campaign_ids) { [campaign.id] }
    let(:project_id) { project.id }

    context '200' do
      example_request 'Getting a list of orders' do
        user = JSON.parse(response_body)
        expect(user['id']).to be
        expect(user['first_name']).to eq first_name
        expect(user['last_name']).to eq last_name
        expect(user['email']).to eq email
        expect(user['campaign_ids']).to eq [campaign.id]
        expect(status).to eq(200)
      end
    end
  end

  put "/api/v1/projects/:project_id/users/:user_id" do
    route_summary 'Updates user details'

    with_options scope: :user, with_example: true do
      parameter :first_name, 'First Name'
      parameter :last_name, 'Last Name'
      parameter :email, 'Email'
      parameter :password, 'Password'
    end

    let(:first_name) { 'Brian' }
    let(:last_name) { 'Ortega' }
    let(:email) { 'ortega@example.com' }
    let(:password) { 'password' }
    let(:project_id) { project.id }
    let(:user_id) { user.id }

    context '200' do
      example_request 'Update the user' do
        user = JSON.parse(response_body)
        expect(user['first_name']).to eq first_name
        expect(user['last_name']).to eq last_name
        expect(user['email']).to eq email
        expect(status).to eq(200)
      end
    end
  end

  post "/api/v1/projects/:project_id/users/:user_id/sso" do
    route_summary 'Creates a new authenticated login URL'

    let(:project_id) { project.id }
    let(:user_id) { user.id }

    example '200' do
      do_request
      response = JSON.parse(response_body)
      expect(response['expires_at']).to be
      expect(response['url']).to be
      expect(status).to eq(200)
    end
  end
end
