require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Campaigns" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Campaigns'
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  before { create(:api_key, token: 'token', membership: membership) }
  authentication :basic, 'token'

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
    let(:project_id) { project.id }


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

    let(:user) { create(:user, project: project) }
    let(:project_id) { project.id }
    let(:user_id) { user.id }

    before do
      campaign = create(:campaign, parent: project, name: 'Super campaign', id: 1111)
      create(:membership, client: campaign, user: user)
    end

    context '200' do
      example_request '...' do
        campaigns = JSON.parse(response_body)
        expect(campaigns.first['name']).to eq 'Super campaign'
        expect(campaigns.first['id']).to eq 1111
        expect(campaigns.first).to have_key('created_at')
        expect(campaigns.first).to have_key('updated_at')
        expect(status).to eq(200)
      end
    end
  end
end
