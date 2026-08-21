# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Users' do
  let!(:membership) { create(:client_admin_membership, :with_application_user) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:user) { create(:user, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_datasheet) { create(:sheet, campaign: campaign, type: 'Datasheet') }
  let!(:project_datasheet) { create(:sheet, project: project, type: 'Datasheet') }
  let!(:campaign_datasheet_columns) do
    campaign_datasheet.sheet_columns << create(
      :sheet_column, sheet: campaign_datasheet, name: 'Current Position', column_type: 'string'
    )
    campaign_datasheet.sheet_columns << create(
      :sheet_column, sheet: campaign_datasheet, name: 'Department', column_type: 'string'
    )
    campaign_datasheet.sheet_columns << create(
      :sheet_column, sheet: campaign_datasheet, name: 'Location', column_type: 'string'
    )
  end
  let!(:project_datasheet_columns) do
    project_datasheet.sheet_columns << create(
      :sheet_column, sheet: project_datasheet, name: 'Current Position', column_type: 'string'
    )
  end
  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

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
      security [basic: [], bearer: []]
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
      security [basic: [], bearer: []]
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
        let(:campaign_user_external_id) { Faker::Internet.uuid }
        let(:user_external_id) { Faker::Internet.uuid }

        context 'default user creation' do
          let(:body) do
            {
              email: email,
              first_name: first_name,
              last_name: last_name,
              user_external_id: user_external_id,
              campaigns: [{
                id: campaign.id,
                active: true,
                campaign_user_external_id: campaign_user_external_id,
                existing_record: 'new_evaluation',
                datasheet: {
                  'Current Position' => 'Manager',
                  'Department' => 'HR',
                  'Location' => 'London'
                }
              }],
              project_datasheet: {
                'Current Position' => 'Developer'
              },
              existing_record: 'accept'
            }
          end

          run_test! do |response|
            user = JSON.parse(response.body)
            campaign_user = campaign.campaign_users.find_by(user_id: user['id'])

            expect(user['id']).to be
            expect(user['first_name']).to eq first_name
            expect(user['last_name']).to eq last_name
            expect(user['user_external_id']).to eq user_external_id
            expect(user['email']).to eq email
            expect(user['campaigns'][0]['id']).to eq campaign.id
            expect(user['campaigns'][0]['campaign_user_external_id']).to eq campaign_user_external_id
            expect(user['campaigns'][0]['datasheet']).to eq(
              {
                'Current Position' => 'Manager',
                'Department' => 'HR',
                'Location' => 'London'
              }
            )
            expect(user['project_datasheet']).to eq(
              {
                'Current Position' => 'Developer'
              }
            )

            expect(campaign_user.active).to eq true
            expect(campaign_user.external_id).to eq campaign_user_external_id
            expect(campaign_user.schedule_start_date).to eq nil
            expect(campaign_user.schedule_end_date).to eq nil
            expect(campaign_datasheet.rows.find_by(email: email).sheet_row_data.pluck(:string_value)).to eq(
              %w[Manager HR London]
            )
            expect(project_datasheet.rows.find_by(email: email).sheet_row_data.pluck(:string_value)).to eq(
              %w[Developer]
            )
          end
        end

        context 'with campaign schedule dates' do
          let(:schedule_start_date) { 2.days.from_now.beginning_of_day }
          let(:schedule_end_date) { 3.days.from_now.beginning_of_day }
          let(:body) do
            { email: email, first_name: first_name, last_name: last_name,
              campaigns: [{
                id: campaign.id,
                active: true,
                existing_record: 'new_evaluation',
                schedule_start_date:,
                schedule_end_date:
              }] }
          end

          run_test! do |response|
            user = JSON.parse(response.body)
            campaign_user = campaign.campaign_users.find_by(user_id: user['id'])

            expect(user['id']).to be
            expect(campaign_user.schedule_start_date).to eq schedule_start_date
            expect(campaign_user.schedule_end_date).to eq schedule_end_date
          end
        end

        context 'with existing_record accept (upsert)' do
          let(:email) { 'upsert@example.com' }
          let(:body) do
            {
              email: email,
              first_name: first_name,
              last_name: last_name,
              campaigns: [
                { id: campaign.id, active: true, existing_record: 'new_evaluation' }
              ],
              existing_record: 'accept'
            }
          end

          before do
            existing_user = create(:user, project: project, email: 'max@example.com')
            create(:campaign_user, campaign: campaign, user: existing_user)
          end

          run_test! do |response|
            user = JSON.parse(response.body)
            expect(user['id']).to be
            expect(user['first_name']).to eq first_name
            expect(user['email']).to eq email
            expect(user['campaigns'][0]['id']).to eq campaign.id
          end
        end

        context 'with locale and custom_profile_fields' do
          let(:email) { 'locale@example.com' }
          let!(:profile_question) do
            create(:question, props: { questionText: 'Department', type: 'SingleAnswer',
                                       choices: 3, choicesTexts: %w[Engineering HR Finance] })
          end
          let!(:profile_field) do
            create(:profile_field, profile_setting: project.profile_setting, question: profile_question)
          end
          let(:body) do
            {
              email: email,
              first_name: first_name,
              last_name: last_name,
              locale: 'ar',
              custom_profile_fields: { 'Department' => 'Engineering' },
              campaigns: [{ id: campaign.id, active: true, existing_record: 'new_evaluation' }]
            }
          end

          before { project.update!(locales: %w[en ar]) }

          run_test! do |response|
            user_data = JSON.parse(response.body)

            expect(user_data['locale']).to eq('ar')
            expect(user_data['custom_profile_fields']).to eq('Department' => 'Engineering')
          end
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
        let(:project_id) { project.id }

        context 'email already taken' do
          let(:email) { 'max@example.com' }
          let(:campaign_ids) { [campaign.id] }
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

        context 'when custom_profile_fields contains an unknown field' do
          let(:email) { 'unknown-field@example.com' }
          let(:body) do
            {
              email: email,
              first_name: first_name,
              last_name: last_name,
              custom_profile_fields: { 'NonExistentField' => 'some value' },
              campaigns: [{ id: campaign.id, active: true, existing_record: 'new_evaluation' }]
            }
          end

          run_test! do |response|
            error = JSON.parse(response.body)
            expect(error['code']).to eq(1002)
            expect(error['message']).to eq('Validation error')
            expect(error['more_info']).to include('Unknown field: NonExistentField')
          end
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
            'more_info' => I18n.t('licenses.not_enough_license',
                                  client_name: membership.client.name,
                                  report_name: report.report_families.first.name),
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
      security [basic: [], bearer: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :'X-USER-ID-TYPE', in: :header, type: :string, required: false,
                description: 'Specify "external_id" or "email" to use non-integer user identifiers'
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
        let(:user_external_id) { Faker::Internet.uuid }
        let(:body) do
          { email: email, first_name: first_name, last_name: last_name, user_external_id: user_external_id }
        end

        run_test! do |response|
          user = JSON.parse(response.body)
          expect(user['first_name']).to eq first_name
          expect(user['last_name']).to eq last_name
          expect(user['email']).to eq email
          expect(user['user_external_id']).to eq user_external_id
        end

        context 'with locale and custom_profile_fields' do
          let!(:profile_question) do
            create(:question, props: { questionText: 'Home Office Location', type: 'SingleAnswer',
                                       choices: 3, choicesTexts: %w[Delhi Mumbai Bangalore] })
          end
          let!(:profile_field) do
            create(:profile_field, profile_setting: project.profile_setting, question: profile_question)
          end
          let(:body) do
            {
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              locale: 'ar',
              custom_profile_fields: { 'Home Office Location' => 'Delhi' }
            }
          end

          before { project.update!(locales: %w[en ar]) }

          run_test! do |response|
            user_data = JSON.parse(response.body)

            expect(user_data['locale']).to eq('ar')
            expect(user_data['custom_profile_fields']).to eq('Home Office Location' => 'Delhi')
          end
        end

        context 'allows partial value update i.e only first_name or last_name or email to be updated' do
          context 'when only first_name is passed' do
            let(:body) { { first_name: 'UpdatedFirstName' } }

            run_test! do |response|
              user_data = JSON.parse(response.body)

              expect(user_data['first_name']).to eq('UpdatedFirstName')
              expect(user_data['last_name']).to eq(user.last_name)
              expect(user_data['email']).to eq(user.email)
            end
          end

          context 'when only last_name is passed' do
            let(:body) { { last_name: 'UpdatedLastName' } }

            run_test! do |response|
              user_data = JSON.parse(response.body)

              expect(user_data['first_name']).to eq(user.first_name)
              expect(user_data['last_name']).to eq('UpdatedLastName')
              expect(user_data['email']).to eq(user.email)
            end
          end

          context 'when only email is passed' do
            let(:body) { { email: 'updated.user@example.com' } }

            run_test! do |response|
              user_data = JSON.parse(response.body)

              expect(user_data['first_name']).to eq(user.first_name)
              expect(user_data['last_name']).to eq(user.last_name)
              expect(user_data['email']).to eq('updated.user@example.com')
            end
          end
        end

        context 'allows update using email as id in URL instead of user id' do
          let(:user_id) { user.email }
          let(:'X-USER-ID-TYPE') { 'email' }
          let(:body) { { first_name: 'UpdatedViaEmailId' } }

          run_test! do |response|
            user_data = JSON.parse(response.body)

            expect(user_data['id']).to eq(user.id)
            expect(user_data['first_name']).to eq('UpdatedViaEmailId')
          end
        end
      end

      response '400', 'Validation error' do
        schema '$ref' => '#/definitions/ApiError'

        let(:project_id) { project.id }
        let(:user_id) { user.id }

        context "doesn't allow null or blank values for email, first_name and last_name field" do
          context 'when first_name is blank' do
            let(:body) { { first_name: '' } }

            run_test! do |response|
              error = JSON.parse(response.body)

              expect(error['code']).to eq(1002)
              expect(error['message']).to eq('Validation error')
              expect(error['more_info']).to eq("First name can't be blank")
            end
          end

          context 'when last_name is blank' do
            let(:body) { { last_name: '' } }

            run_test! do |response|
              error = JSON.parse(response.body)

              expect(error['code']).to eq(1002)
              expect(error['message']).to eq('Validation error')
              expect(error['more_info']).to eq("Last name can't be blank")
            end
          end

          context 'when email is blank' do
            let(:body) { { email: '' } }

            run_test! do |response|
              error = JSON.parse(response.body)

              expect(error['code']).to eq(1002)
              expect(error['message']).to eq('Validation error')
              expect(error['more_info']).to eq("Email can't be blank")
            end
          end

          context 'when email is null' do
            let(:body) { { email: nil } }

            run_test! do |response|
              error = JSON.parse(response.body)

              expect(error['code']).to eq(1002)
              expect(error['message']).to eq('Validation error')
              expect(error['more_info']).to eq("Email can't be blank")
            end
          end
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
      security [basic: [], bearer: []]
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
          create(
            :license,
            client: membership.client,
            type: 'common',
            report_family: report_family,
            end_date: 1.month.from_now
          )
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

  path '/projects/{project_id}/campaigns/{campaign_id}/users/{user_id}/results' do
    get 'Get campaign user results' do
      operationId 'GetCampaignUserResults'
      description 'Update user assessments and reports'
      tags 'Users'
      consumes 'application/json'
      security [basic: [], bearer: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      response '200', 'Success' do
        schema '$ref' => '#/definitions/CampaignUserResults'

        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:user_id) { user.id }
        let!(:campaign_user) do
          create(:campaign_user, campaign: campaign, user: user,
            campaign_scores_finalized: true, campaign_scores_calculated_date: Time.current,
            campaign_scores_finalized_date: Time.current)
        end
        let!(:campaign_factor) { create(:campaign_factor, campaign: campaign, output_type: 'numeric') }
        let!(:campaign_factor_value) do
          create(:campaign_factor_value, campaign: campaign, campaign_factor: campaign_factor, user: user,
numeric_value: 2.0)
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body).to eq({
            'finalized' => campaign_user.campaign_scores_finalized,
            'finalized_at' => campaign_user.campaign_scores_finalized_date.as_json,
            'calculated_at' => campaign_user.campaign_scores_calculated_date.as_json,
            'results' => [
              {
                'id' => campaign_factor.code,
                'name' => campaign_factor.name,
                'value' => campaign_factor_value.numeric_value,
                'value_type' => 'numeric'
              }
            ]
          })
        end
      end
    end
  end
end
