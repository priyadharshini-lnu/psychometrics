# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'New Campaigns' do
  let!(:membership) { create(:client_admin_membership, :with_application_user) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }

  path '/projects/{project_id}/campaigns' do
    get 'Get all campaigns for a project' do
      operationId 'GetProjectCampaigns'
      description 'Get all campaigns associated with a project'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: [], bearer: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :status, in: :query, type: :string, required: false,
                description: 'Filter campaigns by status (comma-separated for multiple)'

      response '200', 'Success with no status filter' do
        schema type: 'array', items: { '$ref' => '#/definitions/Campaign' }
        examples 'application/json' => [
          {
            id: 367,
            name: 'Employee Engagement',
            created_at: '2018-02-11T10:55:25.569+04:00',
            updated_at: '2018-02-11T10:55:25.569+04:00'
          }
        ]

        let(:project_id) { project.id }
        let!(:project_campaigns) { create_list(:campaign, 3, project: project) }
        let!(:other_campaign) { create(:campaign) }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

        run_test! do |response|
          campaigns = JSON.parse(response.body)
          expect(campaigns.length).to eq(3)
          expect(campaigns.pluck('id')).to match_array(project_campaigns.map(&:id))
          expect(campaigns.pluck('id')).not_to include(other_campaign.id)
        end
      end

      response '200', 'Success with single status filter' do
        schema type: 'array', items: { '$ref' => '#/definitions/Campaign' }

        let(:project_id) { project.id }
        let!(:active_campaign) { create(:campaign, project: project, status: 'active') }
        let!(:inactive_campaign) { create(:campaign, project: project, status: 'inactive') }
        let(:status) { 'active' }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

        run_test! do |response|
          campaigns = JSON.parse(response.body)
          expect(campaigns.length).to eq(1)
          expect(campaigns.first['id']).to eq(active_campaign.id)
        end
      end

      response '200', 'Success with multiple status filter' do
        schema type: 'array', items: { '$ref' => '#/definitions/Campaign' }

        let(:project_id) { project.id }
        let!(:active_campaign) { create(:campaign, project: project, status: 'active') }
        let!(:closed_campaign) { create(:campaign, project: project, status: 'closed') }
        let!(:inactive_campaign) { create(:campaign, project: project, status: 'inactive') }
        let(:status) { 'active,closed' }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

        run_test! do |response|
          campaigns = JSON.parse(response.body)
          expect(campaigns.length).to eq(2)
          campaign_ids = campaigns.pluck('id')
          expect(campaign_ids).to include(active_campaign.id, closed_campaign.id)
          expect(campaign_ids).not_to include(inactive_campaign.id)
        end
      end

      response '400', 'Invalid status parameter' do
        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          code: 1002,
          message: 'Validation error',
          more_info: 'Status The following status parameters are invalid: invalid_status. ' \
                     'Valid statuses are: active, closed, inactive, archived',
          meta: nil
        }

        let(:project_id) { project.id }
        let(:status) { 'invalid_status' }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1002,
            'message' => 'Validation error',
            'more_info' => 'Status The following status parameters are invalid: invalid_status. ' \
                           'Valid statuses are: active, closed, inactive, archived',
            'meta' => nil
          )
        end
      end

      response '401', 'Authentication error' do
        let(:project_id) { project.id }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          code: 1000,
          message: 'Invalid authentication',
          more_info: nil,
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1000,
            'message' => 'Invalid authentication',
            'more_info' => nil,
            'meta' => nil
          )
        end
      end
    end
  end
end
