# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Campaigns' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:campaign_2) { create(:campaign, project: project) }
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
          'id': 770,
          'name': 'Sales Executive Recruitment May 2020',
          'created_at': '2019-03-05T10:56:53.349+04:00',
          'updated_at': '2019-03-05T10:56:53.349+04:00'
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

      response '400', 'Campaign name is not filled' do
        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          'code' => 1002,
          'message' => 'Validation error',
          'more_info' => "Name can't be blank",
          'meta' => nil
        }

        let(:campaign_id) { campaign.id }
        let(:project_id) { project.id }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1002,
            'message' => 'Validation error',
            'more_info' => "Name can't be blank",
            'meta' => nil
          )
        end
      end

      response '404', 'Campaign not found' do
        let(:project_id) { project.id }
        let(:campaign_id) { 1111 }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          'code': 1005,
          'message': 'Resource not found',
          'more_info': 'Campaign with id=111 is not found',
          'meta': nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1005,
            'message' => 'Resource not found',
            'more_info' => 'Campaign with id=1111 is not found',
            'meta' => nil
          )
        end
      end
    end
  end
  path '/projects/{project_id}/users/{user_id}/campaigns' do
    post 'Add user to campaigns' do
      operationId 'AddUserCampaigns'
      description 'Adds new campaigns to the user. Adding campaigns to user assigns the campaign\'s default \\
assessments and reports.'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/NewUserCampaigns' }, required: true

      response '200', 'New user created' do
        schema '$ref' => '#/definitions/User'
        examples 'application/json' => {
          'id': 14_602,
          'first_name': 'John',
          'last_name': 'Doe',
          'email': 'john.doe@example.com',
          'created_at': '2019-03-04T15:47:33.570+04:00',
          'updated_at': '2019-03-04T15:47:33.950+04:00',
          'campaign_ids': [
            510
          ]
        }

        let(:user) { create(:user, project: project) }
        let(:campaigns) do
          [
            { 'id' => campaign.id, 'active' => true, 'existing_record' => 'new_evaluation' },
            { 'id' => campaign_2.id, 'active' => false, 'existing_record' => 'copy_evaluation' }
          ]
        end
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:body) { { campaigns: campaigns } }

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user).to have_key('first_name')
          expect(user).to have_key('last_name')
          expect(user['campaigns'].map { |c| c['id'] }).to eq [campaign.id, campaign_2.id]
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

      response '200', 'Success' do
        schema type: 'array', items: { '$ref' => '#/definitions/UserCampaign' }

        examples 'application/json' => [
          {
            'id': 367,
            'name': 'Employee Engagement',
            'created_at': '2018-02-11T10:55:25.569+04:00',
            'updated_at': '2018-02-11T10:55:25.569+04:00'
          }
        ]

        let(:user) { create(:user, project: project) }
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before do
          campaign = create(:campaign, project: project, name: 'Super campaign', id: 1111)
          create(:campaign_user, campaign: campaign, user: user)
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
  path '/projects/{project_id}/campaigns' do
    post 'Create a campaign' do
      operationId 'CreateCampaign'
      description 'Create new campaign'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/NewCampaign' }, required: true

      response '200', 'Campaign created' do
        schema '$ref' => '#/definitions/Campaign'
        examples 'application/json' => {
          'id': 770,
          'name': 'Campaign 1',
          'status': 'active',
          'instructions': 'Instr',
          'enable_instructions': true,
          'duration': 111,
          'fixed_time': true,
          'start_date': '2019-03-05T10:56:53.349+04:00',
          'end_date': '2020-03-05T10:56:53.349+04:00',
          'created_at': '2019-03-05T10:56:53.349+04:00',
          'updated_at': '2019-03-05T10:56:53.349+04:00'
        }

        let(:project_id) { project.id }
        let(:body) do
          {
            name: 'camp1',
            status: 'active',
            start_date: '2019-03-05T10:56:53.349+04:00',
            end_date: '2019-04-05T10:56:53.349+04:00',
            fixed_time: true,
            duration: 111,
            enable_instructions: true,
            instructions: '<div>My Instructions</div>'
          }
        end

        run_test! do |response|
          campaign = JSON.parse(response.body)
          expect(campaign).to have_key('id')
          expect(campaign['name']).to eq 'camp1'
          expect(campaign['status']).to eq 'active'
          expect(campaign['start_date']).to eq '2019-03-05T10:56:53.349+04:00'
          expect(campaign['end_date']).to eq '2019-04-05T10:56:53.349+04:00'
          expect(campaign['fixed_time']).to eq true
          expect(campaign['duration']).to eq 111
          expect(campaign['enable_instructions']).to eq true
          expect(campaign['instructions']).to eq '<div>My Instructions</div>'
        end
      end
    end
  end

  path '/projects/{project_id}/campaigns/{campaign_id}' do
    put 'Update a campaign' do
      operationId 'UpdateCampaign'
      description 'Update campaign'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedCampaign' }, required: true

      response '200', 'Campaign updated' do
        schema '$ref' => '#/definitions/Campaign'
        examples 'application/json' => {
          'name': 'Campaign 1',
          'status': 'active',
          'instructions': 'Instr',
          'enable_instructions': true,
          'duration': 111,
          'fixed_time': true,
          'start_date': '2019-03-05T10:56:53.349+04:00',
          'end_date': '2020-03-05T10:56:53.349+04:00',
          'created_at': '2019-03-05T10:56:53.349+04:00',
          'updated_at': '2019-03-05T10:56:53.349+04:00'
        }

        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:body) do
          {
            name: 'upd_camp1',
            status: 'inactive',
            start_date: '2019-03-05T10:56:53.349+04:00',
            end_date: '2019-04-05T10:56:53.349+04:00',
            fixed_time: true,
            duration: 111,
            enable_instructions: true,
            instructions: '<div>New Instructions</div>'
          }
        end

        run_test! do |response|
          campaign = JSON.parse(response.body)
          expect(campaign).to have_key('id')
          expect(campaign['name']).to eq 'upd_camp1'
          expect(campaign['status']).to eq 'inactive'
          expect(campaign['instructions']).to eq '<div>New Instructions</div>'
        end
      end
    end
  end

  path '/projects/{project_id}/campaigns/{campaign_id}/assessments_reports' do
    put 'Update a campaign assessments and reports' do
      operationId 'UpdateCampaignAssessmentsAndReports'
      description 'Update campaign assessments and reports'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
       schema: { '$ref' => '#/definitions/UpdatedCampaignAssessmentsAndReports' }, required: true

      response '200', 'Assessments and reports updated' do
        schema '$ref' => '#/definitions/AssessmentsAndReports'
        examples 'application/json' => {
          "reports": [
            {
              "id": 1,
              "user_access": true,
              "report_bundle_id": 1
            }
          ],
          "assessments": [
            {
              "id": 1,
              "norm_id": 2
            }
          ]
        }

        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
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
