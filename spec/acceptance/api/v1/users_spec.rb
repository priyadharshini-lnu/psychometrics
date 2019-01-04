require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Users within particular project'

  before { create(:user) }

  post "/api/v1/projects/:project_id/users" do
    header 'Content-Type', 'application/json'
    route_summary 'Adds a new user to the project'

    with_options with_example: true do
      parameter :first_name, 'First name of new user'
      parameter :last_name, 'Last name of new user'
      parameter :email, 'Email of new user', required: true
      parameter :password, 'Password for new user', required: true
      parameter :accepted_terms, 'Accepted terms', required: true
      parameter :campaign_ids, 'Array of campaign ids'
    end


    parameter :first_name, "Current page of orders", with_example: true

    let(:first_name) { 'Max' }
    let(:last_name) { 'Holloway' }
    let(:email) { 'email@example.com' }
    let(:password) { 'password' }
    let(:accepted_terms) { true }
    let(:raw_post) { params.to_json }
    let(:campaign_ids) { [1, 2] }

    context '200' do
      example_request 'Getting a list of orders' do
        user = JSON.parse(response_body)
        expect(user['first_name']).to eq first_name
        expect(user['last_name']).to eq last_name
        expect(status).to eq(200)
      end
    end
  end

  put "/api/v1/projects/:project_id/users/:user_id" do
    route_summary 'Updates user details'

    with_options with_example: true do
      parameter :first_name, 'John'
      parameter :last_name, 'Doe'
      parameter :email, 'john.doe@example.com'
      parameter :password, 'superpassword'
    end

    example "Update Users Details" do
      do_request

      status.should == 200
    end
  end
end
