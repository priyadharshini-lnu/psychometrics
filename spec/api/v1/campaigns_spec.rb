require 'rails_helper'
require 'rails_helper'
require 'swagger_helper'

describe 'Campaigns' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, parent: project) }
  let(:campaign_2) { create(:campaign, parent: project) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }

  path '/projects/{project_id}/campaigns/{campaign_id}/duplicate' do

    post 'Duplicate a campaign' do
      operationId 'DuplicateCampaign'
      description 'Duplicated campaign will have the same default assessments and reports as the source campaign'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/DuplicatedCampaign' }, required: true

      response '200', 'Campaign duplicated' do
        schema '$ref' => '#/definitions/Campaign'
        examples 'application/json' => {
          "id": 770,
          "name": "Duplicated Campaign Name",
          "created_at": "2019-03-05T10:56:53.349+04:00",
          "updated_at": "2019-03-05T10:56:53.349+04:00"
        }

        let(:campaign_id) { campaign.id }
        let(:project_id) { project.id }
        let(:name) { 'Promotion' }
        let(:body) { { name: name } }

        run_test! do |response|
          campaign = JSON.parse(response.body)
          expect(campaign).to have_key('id')
          expect(campaign['name']).to eq 'Promotion'
        end
      end
    end
  end
  path '/projects/{project_id}/users/{user_id}/campaigns' do

    post 'Add user to campaigns' do
      operationId 'AddUserCampaigns'
      description 'Adds new campaigns to the user. Adding campaigns to user assigns the campaign\'s default assessments and reports.'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/NewCampaigns' }, required: true

      response '200', '' do
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

        let(:user) { create(:user, project: project) }
        let(:campaign_ids) { [campaign.id, campaign_2.id] }
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:body) { {campaign_ids: campaign_ids } }

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user).to have_key('first_name')
          expect(user).to have_key('last_name')
          expect(user['campaign_ids']).to eq [campaign.id, campaign_2.id]
        end
      end
    end
  end

  path '/projects/{project_id}/users/{user_id}/campaigns' do

    get 'Get user campaigns' do
      operationId 'GetUserCampaigns'
      description 'returns all campaigns associated with the user'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      response '200', '' do
        schema type: 'array', items: { '$ref' => '#/definitions/Campaign' }

        examples 'application/json' => [
          {
            "id": 367,
            "name": "Employee Engagement Survey",
            "created_at": "2018-02-11T10:55:25.569+04:00",
            "updated_at": "2018-02-11T10:55:25.569+04:00"
          }
        ]

        let(:user) { create(:user, project: project) }
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before do
          campaign = create(:campaign, parent: project, name: 'Super campaign', id: 1111)
          create(:membership, client: campaign, user: user)
        end
        run_test! do |response|
          campaigns = JSON.parse(response.body)
          expect(campaigns.first['name']).to eq 'Super campaign'
          expect(campaigns.first['id']).to eq 1111
          expect(campaigns.first).to have_key('created_at')
          expect(campaigns.first).to have_key('updated_at')
        end
      end
    end
  end
end
