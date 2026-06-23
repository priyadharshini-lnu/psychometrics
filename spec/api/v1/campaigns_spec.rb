# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Campaigns' do
  let!(:membership) { create(:client_admin_membership, :with_application_user) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:campaign_two) { create(:campaign, project: project) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }

  path '/projects/{project_id}/campaigns/{campaign_id}' do
    get 'Get a campaign' do
      operationId 'GetCampaign'
      description 'Get project campaign'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaign duplicated' do
        schema '$ref' => '#/definitions/Campaign'
        examples 'application/json' => {
          id: 770,
          name: 'Sales Executive Recruitment May 2020',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
        }

        let(:campaign_id) { campaign.id }
        let(:project_id) { project.id }

        run_test! do |response|
          campaign = JSON.parse(response.body)
          expect(campaign).to have_key('id')
        end
      end

      response '404', 'Campaign not found' do
        let(:project_id) { project.id }
        let(:campaign_id) { 1111 }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1005,
          message: 'Resource not found',
          more_info: 'Campaign with id=111 is not found',
          meta: nil
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
          id: 770,
          name: 'Sales Executive Recruitment May 2020',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
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
          code: 1005,
          message: 'Resource not found',
          more_info: 'Campaign with id=111 is not found',
          meta: nil
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
          id: 14_602,
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          email: 'john.doe@example.com',
          created_at: '2019-03-04T15:47:33.570+04:00',
          updated_at: '2019-03-04T15:47:33.950+04:00',
          campaign_ids: [
            510
          ]
        }

        let(:user) { create(:user, project: project) }
        let(:campaigns) do
          [
            { 'id' => campaign.id, 'active' => true, 'existing_record' => 'new_evaluation' },
            { 'id' => campaign_two.id, 'active' => false, 'existing_record' => 'copy_evaluation' }
          ]
        end
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:body) { { campaigns: campaigns } }

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user).to have_key('first_name')
          expect(user).to have_key('last_name')
          expect(user).to have_key('gender')
          expect(user['campaigns'].pluck('id')).to contain_exactly(campaign.id, campaign_two.id)
        end
      end

      response '200', 'New user created' do
        schema '$ref' => '#/definitions/User'
        examples 'application/json' => {
          id: 14_602,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          gender: 'male',
          created_at: '2019-03-04T15:47:33.570+04:00',
          updated_at: '2019-03-04T15:47:33.950+04:00',
          campaign_ids: [
            510
          ]
        }

        let(:user) { create(:user, project: project) }
        let(:schedule_start_date) { 2.days.from_now.beginning_of_day }
        let(:schedule_end_date) { 3.days.from_now.beginning_of_day }
        let(:campaigns) do
          [
            { 'id' => campaign.id, 'active' => true, 'existing_record' => 'new_evaluation', schedule_end_date:,
              schedule_start_date: },
            { 'id' => campaign_two.id, 'active' => false, 'existing_record' => 'copy_evaluation' }
          ]
        end
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:body) { { campaigns: campaigns } }

        run_test! do |response|
          user = JSON.parse(response.body)
          campaign_user = campaign.campaign_users.find_by(user_id: user['id'])

          expect(user).to have_key('first_name')
          expect(user).to have_key('last_name')
          expect(user).to have_key('gender')
          expect(user['campaigns'].pluck('id')).to contain_exactly(campaign.id, campaign_two.id)

          expect(campaign_user.active).to eq campaigns[0]['active']
          expect(campaign_user.schedule_start_date).to eq schedule_start_date
          expect(campaign_user.schedule_end_date).to eq schedule_end_date
        end
      end
    end
  end

  path '/projects/{project_id}/users/{user_id}/campaigns/{id}' do
    patch 'Update campaign user schedule' do
      operationId 'UpdateCampaignUserSchedule'
      description 'Updates the schedule start and end dates for a specific campaign assigned to a user'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]

      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedCampaignUser' }, required: true

      response '200', 'Campaign schedule updated' do
        let(:user) { create(:user, project: project) }
        let(:campaign) { create(:campaign, project: project, name: 'Super campaign', id: 1111) }
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:id) { campaign.id }
        let(:schedule_start_date) { 2.days.from_now.beginning_of_day }
        let(:schedule_end_date) { 3.days.from_now.beginning_of_day }
        let(:body) do
          {
            schedule_start_date:,
            schedule_end_date:
          }
        end

        before do
          create(:campaign_user, campaign: campaign, user: user)
        end

        run_test! do |response|
          result = JSON.parse(response.body)
          expect(Time.zone.parse(result['schedule_start_date'])).to be_within(1.second).of(schedule_start_date)
          expect(Time.zone.parse(result['schedule_end_date'])).to be_within(1.second).of(schedule_end_date)
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
            id: 367,
            name: 'Employee Engagement',
            created_at: '2018-02-11T10:55:25.569+04:00',
            updated_at: '2018-02-11T10:55:25.569+04:00'
          }
        ]

        let(:user) { create(:user, project: project) }
        let(:project_id) { project.id }
        let(:user_id) { user.id }
        before do
          @user_campaign = create(:campaign, project: project, name: 'Super campaign', id: 1111)
          @other_campaign = create(:campaign, project: project, name: 'Other campaign', id: 2222)
          create(:campaign_user, campaign: @user_campaign, user: user)
        end
        run_test! do |response|
          campaigns = JSON.parse(response.body)
          expect(campaigns.length).to eq(1)
          expect(campaigns.first['name']).to eq 'Super campaign'
          expect(campaigns.first['id']).to eq 1111
          expect(campaigns.first).to have_key('created_at')
          expect(campaigns.first).to have_key('updated_at')
          expect(campaigns.pluck('id')).not_to include(@other_campaign.id)
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
          id: 770,
          name: 'Campaign 1',
          description: 'Campaign Description',
          status: 'active',
          instructions: 'Instr',
          enable_instructions: true,
          duration: 111,
          fixed_time: true,
          start_date: '2019-03-05T10:56:53.349+04:00',
          end_date: '2020-03-05T10:56:53.349+04:00',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
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
            instructions: '<div>My Instructions</div>',
            description: 'Campaign Description'
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
          expect(campaign['description']).to eq 'Campaign Description'
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
          name: 'Campaign 1',
          status: 'active',
          instructions: 'Instr',
          enable_instructions: true,
          duration: 111,
          fixed_time: true,
          start_date: '2019-03-05T10:56:53.349+04:00',
          end_date: '2020-03-05T10:56:53.349+04:00',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
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
            instructions: '<div>New Instructions</div>',
            description: 'New Description'
          }
        end

        run_test! do |response|
          campaign = JSON.parse(response.body)
          expect(campaign).to have_key('id')
          expect(campaign['name']).to eq 'upd_camp1'
          expect(campaign['status']).to eq 'inactive'
          expect(campaign['instructions']).to eq '<div>New Instructions</div>'
          expect(campaign['description']).to eq 'New Description'
        end
      end
    end
  end

  path '/projects/{project_id}/campaigns/{campaign_id}/assessments_reports' do
    get 'Get a campaign assessments and reports' do
      operationId 'UpdateCampaignAssessmentsAndReports'
      description 'Update campaign assessments and reports'
      tags 'Campaigns'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Assessments and reports' do
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
        let(:assessment) { create(:assessment) }
        let!(:norm) { create(:norm, dimension: assessment.dimension) }
        let(:report) { create(:report, assessments: [assessment]) }
        let(:report_family) { create(:report_family, reports: [report]) }

        before do
          create(:campaign_report, report: report, campaign: campaign, report_family: report_family)
          create(:campaign_assessment, assessment: assessment, campaign: campaign)
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body['reports'].first).to eq({
            'id' => report.id,
            'user_access' => false,
            'report_bundle_id' => report_family.id
          })
          expect(body['assessments'].first).to eq({
            'id' => assessment.id,
            'norm_id' => nil
          })
        end
      end
    end

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

  path '/projects/{project_id}/campaigns/{campaign_id}/assessments/{assessment_id}' do
    let(:assessment) { create(:assessment) }
    let!(:norm) { create(:norm, dimension: assessment.dimension) }
    let(:report) { create(:report, assessments: [assessment]) }
    let(:report_family) { create(:report_family, reports: [report]) }

    put 'Update campaign assessments' do
      operationId 'Update Campaign Assessments'
      description 'Update Campaign assessments'
      tags 'Assessments'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :assessment_id, in: :path, type: :string, required: false
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedAssessment' }, required: true

      response '200', 'CampaignAssessments updating' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:assessment_id) { assessment.id }

        let(:body) do
          {
            norm_id: norm.id
          }
        end

        before do
          @campaign_assessment = create(:campaign_assessment, campaign: campaign, assessment: assessment)
        end

        schema '$ref' => '#/definitions/UpdatedAssessment'

        examples 'application/json' => {
          norm_id: nil
        }

        run_test! do |response|
          campaign_assessment = JSON.parse(response.body)
          expect(campaign_assessment['norm_id']).to eq(norm.id)
        end
      end

      response '401', 'Auth error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:assessment_id) { assessment.id }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' =>
        {
          code: 1000,
          message: 'Invalid authentication',
          more_info: nil,
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq('code' => 1000, 'message' => 'Invalid authentication', 'more_info' => nil, 'meta' => nil)
        end
      end

      response '401', 'Authentication error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:assessment_id) { assessment.id }
        before { membership.user.update(disabled: true) }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1000,
          message: 'Invalid authentication',
          more_info: 'API User is disabled',
          meta: nil
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
    end

    delete 'Delete campaign assessments' do
      operationId 'DeleteCampaignAssessments'
      description 'Delete campaign assessments'
      tags 'Assessments'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :assessment_id, in: :path, type: :string, required: false

      response '200', 'CampaignAssessments deleting' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:assessment_id) { assessment.id }
        before do
          @campaign_assessment = create(:campaign_assessment, campaign: campaign, assessment: assessment)
        end

        schema '$ref' => '#/definitions/UserAssessment'

        run_test! do |_|
          expect(CampaignAssessment.find_by(id: @campaign_assessment.id)).to eq(nil)
        end
      end

      response '401', 'Auth error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:assessment_id) { assessment.id }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' =>
        {
          code: 1000,
          message: 'Invalid authentication',
          more_info: nil,
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq('code' => 1000, 'message' => 'Invalid authentication', 'more_info' => nil, 'meta' => nil)
        end
      end

      response '401', 'Authentication error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:assessment_id) { assessment.id }
        before { membership.user.update(disabled: true) }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1000,
          message: 'Invalid authentication',
          more_info: 'API User is disabled',
          meta: nil
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
    end
  end

  path '/projects/{project_id}/campaigns/{campaign_id}/reports/{report_id}' do
    let!(:assessment) { create(:assessment) }
    let(:report) { create(:report, assessments: [assessment]) }
    let(:report_family) { create(:report_family, reports: [report]) }

    put 'Update campaign report' do
      operationId 'Update Campaign Report'
      description 'Update Campaign Report'
      tags 'Reports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :report_id, in: :path, type: :string, required: false
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedReport' }, required: true

      response '200', 'CampaignReport updating' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:report_id) { report.id }

        let(:body) do
          {
            user_access: true,
            assessor_access: true
          }
        end

        before do
          @campaign_report = create(:campaign_report, campaign: campaign, report: report)
        end

        schema '$ref' => '#/definitions/UpdatedReport'

        examples 'application/json' => {
          user_access: true,
          assessor_access: true
        }

        run_test! do |response|
          campaign_report = JSON.parse(response.body)
          expect(campaign_report['user_access']).to eq(true)
          expect(campaign_report['assessor_access']).to eq(true)
        end
      end

      response '401', 'Auth error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:report_id) { report.id }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' =>
        {
          code: 1000,
          message: 'Invalid authentication',
          more_info: nil,
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq('code' => 1000, 'message' => 'Invalid authentication', 'more_info' => nil, 'meta' => nil)
        end
      end

      response '401', 'Authentication error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:report_id) { report.id }
        before { membership.user.update(disabled: true) }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1000,
          message: 'Invalid authentication',
          more_info: 'API User is disabled',
          meta: nil
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
    end

    delete 'Delete campaign report' do
      operationId 'DeleteCampaignReport'
      description 'Delete campaign report'
      tags 'Reports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :report_id, in: :path, type: :string, required: false

      response '200', 'CampaignReport deleting' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:report_id) { report.id }
        before do
          @campaign_report = create(:campaign_report, campaign: campaign, report: report)
        end

        schema '$ref' => '#/definitions/UserAssessment'

        run_test! do |_|
          expect(CampaignReport.find_by(id: @campaign_report.id)).to eq(nil)
        end
      end

      response '401', 'Auth error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:report_id) { report.id }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' =>
        {
          code: 1000,
          message: 'Invalid authentication',
          more_info: nil,
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq('code' => 1000, 'message' => 'Invalid authentication', 'more_info' => nil, 'meta' => nil)
        end
      end

      response '401', 'Authentication error' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:report_id) { report.id }
        before { membership.user.update(disabled: true) }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1000,
          message: 'Invalid authentication',
          more_info: 'API User is disabled',
          meta: nil
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
    end
  end
end
