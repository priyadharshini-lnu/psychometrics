# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Assessments' do
  let!(:membership) { create(:client_admin_membership) }
  let(:campaign) { create(:client_campaign, parent: project) }
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

      response '200', 'Assessments presented' do
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before do
          user_membership = create(:membership, client: campaign, user: user)
          assessment = create(:assessment, :with_report, name: 'Super Assessment')
          user_membership.client.reports = assessment.reports
          user_membership.client.assessments = [assessment]
          user_membership.client.project.assessments = [assessment]
          user_membership.client.project.reports = assessment.reports
          create(:assign, membership: user_membership, assessment: assessment)
        end
        schema type: 'array', items: { '$ref' => '#/definitions/UserAssessment' }

        examples 'application/json' => [
          {
            "id": '11234',
            "name": 'Assessment 1',
            "status": 'completed',
            "started_at": '2019-03-04T15:47:33.570+04:00',
            "completed_at": '2019-03-04T15:47:33.570+04:00'
          },
          {
            "id": '11235',
            "name": 'Assessment 2',
            "status": 'completed',
            "started_at": '2019-03-04T15:47:33.570+04:00',
            "completed_at": '2019-03-04T15:47:33.570+04:00'
          },
          {
            "id": '11236',
            "name": 'Assessment 3',
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
          "code": 1000,
          "message": 'Invalid authentication',
          "more_info": nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq ({ 'code' => 1000, 'message' => 'Invalid authentication', 'more_info' => nil })
        end
      end

      response '401', 'We are disabled' do
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before { membership.user.update(disabled: true) }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          "code": 1000,
          "message": 'Invalid authentication',
          "more_info": 'User for api token is disabled'
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq ({
            'code' => 1000,
            'message' => 'Invalid authentication',
            'more_info' => 'User for api token is disabled'
          })
        end
      end

      response '404', 'User is not found' do
        let(:project_id) { project.id }
        let(:user_id) { 111 }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          "code": 1005,
          "message": 'Resource not found',
          "more_info": 'User with id=111 is not found'
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1005,
                                'message' => 'Resource not found',
                                'more_info' => 'User with id=111 is not found'
          )
        end
      end
    end
  end
end
