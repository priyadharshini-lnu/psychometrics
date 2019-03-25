require 'rails_helper'
require 'rails_helper'
require 'swagger_helper'

describe 'Users' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, parent: project) }
  let(:user) { create(:user, project: project) }
  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  path '/projects/{project_id}/users/{user_id}/sso' do

    post 'Create authenticated SSO URL' do
      operationId 'GetUserSsoUrl'
      tags 'Users'
      description <<~HEREDOC
        Creates an single sign on URL for the user. Response also contains assessment specific URLs. All these URLs will be invalid after the time in `expires_at`.

        Append  **&return_url=<your_application_return_url>** to any SSO URL to be redirected back after user completes the assessment.

        ### Example
        
        `https://example.com/sso?token=d98df98d9f3434asdfasf98987&return_url=https://yourportal.com/tte-redirect?status=ASSESSMENT_STATUS`

        After completing the assessment, user will be redirected to 
        
        `https://yourportal.com/tte-redirect?status=assessment_completed`

        **ASSESSMENT_STATUS** will get replaced with one of assessment_completed, assessment_invalid, invalid_token
      HEREDOC
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      response '200', 'SSO URL Created' do
        schema '$ref' => '#/definitions/SsoUrl'
        examples 'application/json' => {
          "url": "https://example.com/sso?token=d98df98d9f3434asdfasf98987",
          "expires_at": "2014-01-01T23:28:56.782Z",
          "assessments": [
            {
              "id": "3456",
              "name": "Thriving Index Assessment",
              "url": "https://example.com/sso?token=d98df98d9f3434asdfasf98987&assign_id=9875"
            }
          ]
        }

        let(:project_id) { project.id }
        let(:user_id) { user.id }

        run_test! do |response|
          sso_url = JSON.parse(response.body)
          expect(sso_url['url']).to be
          expect(sso_url['expires_at']).to be
        end
      end
    end
  end

  path '/projects/{project_id}/users' do
    post 'Create new user' do
      operationId 'CreateUser'
      tags 'Users'
      description 'Creates a new user and adds to the campaigns specified along with the campaign\'s default assessments and reports.'
      consumes 'application/json'
      security [basic: []]
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

      response '400', 'User with this email exists' do
        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          "code" => 1006,
          "message" => 'User with this email exists',
          "more_info" => "Email address max@example.com is already taken"
        }

        let(:first_name) { 'Max' }
        let(:last_name) { 'Holloway' }
        let(:email) { 'max@example.com' }
        let(:campaign_ids) { [campaign.id] }
        let(:project_id) { project.id }
        let(:body) { { email: email, first_name: first_name, last_name: last_name, campaign_ids: campaign_ids } }

        before { create(:user, project: project, email: 'max@example.com') }
        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq({
                                "code" => 1006,
                                "message" => 'User with this email exists',
                                "more_info" => "Email address max@example.com is already taken"
                              })
        end
      end

      response '404', 'Project is not found' do
        let(:project_id) { 111 }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          "code": 1005,
          "message": 'Resource not found',
          "more_info": 'Project with id=111 is not found',
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq({
                                "code" => 1005,
                                "message" => 'Resource not found',
                                "more_info" => 'Project with id=111 is not found',
                              })
        end
      end

      response '403', 'Not enough licenses' do
        let(:email) { 'max@example.com' }
        let(:campaign_ids) { [campaign.id] }
        let(:project_id) { project.id }
        let(:body) { { email: email, campaign_ids: campaign_ids } }
        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          "code": 1003,
          "message": 'Not enough licenses',
          "more_info": "<b>sss@sssss.com</b> in <b>Al Futtaim</b> has not enough licenses for <b>Cognitive - Entry Level</b> report.",
        }

        let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
        let(:report) { assessment.reports.first }
        before do
          campaign.assessments = [assessment]
          campaign.project.assessments = [assessment]
          campaign.reports = assessment.reports
          campaign.project.reports = assessment.reports
        end
        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq({
                                "code" => 1003,
                                "message" => 'Not enough licenses',
                                "more_info" => "<b>max@example.com</b> in <b>#{membership.client.name}</b> has not enough licenses for <b>#{report.name}</b> report.",
                              })
        end
      end
    end
  end

  path '/projects/{project_id}/users/{user_id}' do

    put 'Updates user' do
      operationId 'UpdateUser'
      tags 'Users'
      consumes 'application/json'
      security [basic: []]
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
