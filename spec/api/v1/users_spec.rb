# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Users' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:user) { create(:user, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
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
          url: 'https://example.com/sso?token=d98df98d9f3434asdfasf98987',
          expires_at: '2014-01-01T23:28:56.782Z',
          assessments: [
            {
              id: '3456',
              name: 'Thriving Index Assessment',
              description: 'Self-assessment to understand your signature strengths and potential blindspots',
              icon_url: 'https://some.aws.s3.com/icon1.jpg',
              poster_url: 'https://some.aws.s3.com/poster1.jpg',
              url: 'https://example.com/sso?token=d98df98d9f3434asdfasf98987&assign_id=9875',
              status: 'not_started'
            }
          ]
        }

        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let!(:user_assessment) { create(:user_assessment, subject: user, evaluator: user, campaign: campaign) }
        let(:assessment) { user_assessment.assessment }
        before do
          allow_any_instance_of(Assessment).to receive_message_chain(:icon, :url).and_return(Faker::Internet.url)
          allow_any_instance_of(Assessment).to receive_message_chain(:poster, :url).and_return(Faker::Internet.url)
        end

        run_test! do |response|
          sso_url = JSON.parse(response.body)

          expect(sso_url).to have_key('url')
          expect(sso_url).to have_key('expires_at')
          expect(sso_url).to have_key('expires_at')
          expect(sso_url['assessments'].first['description']).to eq(assessment.description)
          expect(sso_url['assessments'].first['icon_url']).to eq(assessment.icon.url)
          expect(sso_url['assessments'].first['poster_url']).to eq(assessment.poster.url)
        end
      end
    end
  end

  path '/projects/{project_id}/users' do
    post 'Create new user' do
      operationId 'CreateUser'
      tags 'Users'
      description 'Creates a new user and adds to the campaigns specified along with \\
the campaign\'s default assessments and reports.'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/NewUser' }, required: true

      response '200', 'User created' do
        schema '$ref' => '#/definitions/User'
        examples 'application/json' => {
          id: 14_602,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          created_at: '2019-03-04T15:47:33.570+04:00',
          updated_at: '2019-03-04T15:47:33.950+04:00',
          campaign_ids: [
            510
          ]
        }

        let(:first_name) { 'Max' }
        let(:last_name) { 'Holloway' }
        let(:email) { 'max@example.com' }
        let(:project_id) { project.id }
        let(:body) do
          { email: email, first_name: first_name, last_name: last_name, campaigns: [
            { id: campaign.id, active: true, existing_record: 'new_evaluation' }
          ] }
        end

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user['id']).to be
          expect(user['first_name']).to eq first_name
          expect(user['last_name']).to eq last_name
          expect(user['email']).to eq email
          expect(user['campaigns'][0]['id']).to eq campaign.id
        end
      end

      response '400', 'User with this email exists' do
        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          'code' => 1006,
          'message' => 'User with this email exists',
          'more_info' => 'Email address john.doe@example.com is already taken',
          'meta' => {
            existing_user: {
              id: 12,
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              created_at: '2019-10-28T17:00:00.000+04:00'
            }
          }
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

          expect(error).to have_key('code')
          expect(error).to have_key('message')
          expect(error).to have_key('more_info')
          expect(error).to have_key('meta')

          meta = error['meta']
          expect(meta).to have_key('existing_user')
          expect(meta['existing_user']).to have_key('id')
          expect(meta['existing_user']).to have_key('first_name')
          expect(meta['existing_user']).to have_key('last_name')
          expect(meta['existing_user']).to have_key('email')
          expect(meta['existing_user']).to have_key('created_at')
        end
      end

      response '404', 'Resource not found' do
        let(:project_id) { 111 }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1005,
          message: 'Resource not found',
          more_info: 'Project with id=111 was not found'
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1005,
            'message' => 'Resource not found',
            'more_info' => 'Project with id=111 was not found',
            'meta' => nil
          )
        end
      end

      response '403', 'Not enough licenses' do
        let(:email) { 'max@example.com' }
        let(:campaign_ids) { [campaign.id] }
        let(:project_id) { project.id }
        let(:body) { { first_name: 'John', last_name: 'Doe', email: email, campaign_ids: campaign_ids } }
        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1003,
          message: 'Not enough licenses',
          more_info: "'Client Tenancy 1' does not have enough licenses for 'report 2'"
        }

        let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
        let(:report) { assessment.reports.first }
        before do
          campaign.assessments = [assessment]
          campaign.project.assessments = [assessment]
          create(:campaign_report, campaign: campaign, report: report, report_family: report.report_families.first)
        end
        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1003,
            'message' => 'Not enough licenses',
            'more_info' => "'#{membership.client.name}' does not have \
enough licenses for '#{report.name}'",
            'meta' => nil
          )
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

      response '200', 'User updated' do
        schema '$ref' => '#/definitions/User'
        examples 'application/json' => {
          id: 14_602,
          first_name: 'Kamaru',
          last_name: 'Usman',
          email: 'marti@gmail.com',
          created_at: '2019-03-04T15:47:33.570+04:00',
          updated_at: '2019-03-04T15:47:33.950+04:00',
          campaign_ids: [
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

  path '/projects/{project_id}/campaigns/{campaign_id}/users/{user_id}/assessments_reports' do
    put 'Update a user assessments and reports' do
      operationId 'UpdateUserAssessmentsAndReports'
      description 'Update user assessments and reports'
      tags 'Users'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/definitions/UpdatedCampaignAssessmentsAndReports' }, required: true

      response '200', 'Assessments and reports updated' do
        schema '$ref' => '#/definitions/AssessmentsAndReports'
        examples 'application/json' => {
          reports: [
            {
              id: 1,
              user_access: true,
              report_bundle_id: 1
            }
          ],
          assessments: [
            {
              id: 1,
              norm_id: 2
            }
          ]
        }

        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:user_id) { user.id }
        let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
        let(:assessment) { create(:assessment) }
        let!(:norm) { create(:norm, dimension: assessment.dimension) }
        let(:report) { create(:report, assessments: [assessment]) }
        let(:report_family) { create(:report_family, reports: [report]) }
        let(:body) do
          {
            reports: [
              { id: report.id, user_access: true, report_bundle_id: report_family.id }
            ],
            assessments: [
              { id: assessment.id, norm_id: norm.id }
            ]
          }
        end

        before do
          allow(Licenses::Use).to receive(:call!)
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body['reports'].first).to eq({
            'id' => report.id,
            'user_access' => true,
            'report_bundle_id' => report_family.id
          })
          expect(body['assessments'].first).to eq({
            'id' => assessment.id,
            'norm_id' => norm.id
          })
        end
      end
    end
  end
end
