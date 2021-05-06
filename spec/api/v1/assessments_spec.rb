# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Assessments' do
  let!(:membership) { create(:client_admin_membership) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:user) { create(:user, project: project) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }

  path '/projects/{project_id}/users/{user_id}/assessments' do
    get 'Get user assessments' do
      operationId 'GetUserAssessments'
      description 'List of assessments currently assigned to the user'
      tags 'Assessments'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :campaign_id, in: :query, type: :string, required: false,
      description: 'if is not filled, the system takes the last campaign id'

      response '200', 'Assessments presented' do
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before do
          campaign_user = create(:campaign_user, campaign: campaign, user: user)
          assessment = create(:assessment, :with_report, name: 'Super Assessment')
          campaign_user.campaign.reports = assessment.reports
          campaign_user.campaign.assessments = [assessment]
          create(:user_assessment, subject: user, evaluator: user, assessment: assessment, campaign: campaign)
        end
        schema type: 'array', items: { '$ref' => '#/definitions/UserAssessment' }

        examples 'application/json' => [
          {
            "id": '11234',
            "name": 'Assessment 1',
            "campaign_id": 1,
            "status": 'completed',
            "started_at": '2019-03-04T15:47:33.570+04:00',
            "completed_at": '2019-03-04T15:47:33.570+04:00'
          },
          {
            "id": '11235',
            "name": 'Assessment 2',
            "campaign_id": 1,
            "status": 'completed',
            "started_at": '2019-03-04T15:47:33.570+04:00',
            "completed_at": '2019-03-04T15:47:33.570+04:00'
          },
          {
            "id": '11236',
            "name": 'Assessment 3',
            "campaign_id": 1,
            "status": 'completed',
            "started_at": '2019-03-04T15:47:33.570+04:00',
            "completed_at": '2019-03-04T15:47:33.570+04:00'
          }
        ]

        run_test! do |response|
          assessments = JSON.parse(response.body)
          expect(assessments.first['name']).to eq 'Super Assessment'
          expect(assessments.first).to have_key('id')
          expect(assessments.first).to have_key('status')
        end
      end

      response '401', 'Auth error' do
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:Authorization) { "Basic #{::Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' =>
        {
          'code': 1000,
          'message': 'Invalid authentication',
          'more_info': nil,
          'meta': nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq('code' => 1000, 'message' => 'Invalid authentication', 'more_info' => nil, 'meta' => nil)
        end
      end

      response '401', 'Authentication error' do
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before { membership.user.update(disabled: true) }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          'code': 1000,
          'message': 'Invalid authentication',
          'more_info': 'API User is disabled',
          'meta': nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1000,
            'message' => 'Invalid authentication',
            'more_info' => 'API User is disabled',
            'meta' => nil
          )
        end
      end

      response '404', 'User was not found' do
        let(:project_id) { project.id }
        let(:user_id) { 111 }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          'code': 1005,
          'message': 'Resource not found',
          'more_info': 'User with id=111 was not found',
          'meta': nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1005,
            'message' => 'Resource not found',
            'more_info' => 'User with id=111 was not found',
            'meta' => nil
          )
        end
      end
    end
  end
end
