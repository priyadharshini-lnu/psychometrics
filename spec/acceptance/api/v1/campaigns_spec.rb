require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Campaigns" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Campaigns'

  before { create(:tenancy) }

  post "/api/v1/projects/:project_id/campaigns/:campaign_id/duplicate" do
    route_summary 'Creates a copy of the campaign without users'

    context '200' do
      example_request '...' do
        campaign = JSON.parse(response_body)
        expect(campaign).to have_key('id')
        expect(campaign).to have_key('name')
        expect(status).to eq(200)
      end
    end
  end

  post "/api/v1/projects/:project_id/users/:user_id/campaigns" do
    route_summary 'Adds user to new campaigns'

    with_options with_example: true do
      parameter :campaign_ids, 'Array of campaign ids'
    end

    let(:campaign_ids) { [1, 2] }


    context '200' do
      example_request '...' do
        user = JSON.parse(response_body)
        expect(user).to have_key('first_name')
        expect(user).to have_key('last_name')
        expect(status).to eq(200)
      end
    end
  end

  get "/api/v1/projects/:project_id/users/:user_id/campaigns" do
    route_summary 'Get user campaigns'

    context '200' do
      example_request '...' do
        campaigns = JSON.parse(response_body)
        expect(campaigns.first).to have_key('id')
        expect(campaigns.first).to have_key('name')
        expect(campaigns.first).to have_key('created_at')
        expect(campaigns.first).to have_key('updated_at')
        expect(status).to eq(200)
      end
    end
  end
end
