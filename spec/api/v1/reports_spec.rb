# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Reports' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:client_campaign, parent: project) }
  let(:user) { create(:user, project: project) }
  let(:dimension) { create(:dimension, :with_multiple_occupations) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment', dimension: dimension) }
  let(:report) { assessment.reports.first }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  let!(:assign) do
    user_membership = create(:membership, client: campaign, user: user)
    user_membership.client.assessments = [assessment]
    user_membership.client.project.assessments = [assessment]
    user_membership.client.reports = assessment.reports
    user_membership.client.project.reports = assessment.reports
    create(:assign, membership: user_membership, assessment: assessment, status: :completed)
  end

  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }
  before do
    allow_any_instance_of(AssignsReport).to receive(:use_license) { 'nth' }
    create(:assigns_report, report: report, assign: assign)
  end

  path '/projects/{project_id}/users/{user_id}/reports' do
    get 'Get user reports' do
      operationId 'GetUserReports'
      description 'All reports currently assigned to the user. Each report object also contains the required\\
 assessments and the user\'s completion status.'
      tags 'Reports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      response '200', 'Get user reports' do
        schema type: 'array', items: { '$ref' => '#/definitions/UserReport' }
        examples 'application/json' => [
          {
            "id": 127,
            "name": 'Thriving Index - Alinma Resource - PRO ',
            "status": 'not_ready',
            "assessments": [
              {
                "id": 91_731,
                "name": 'Thriving Index Assessment - Alinma',
                "status": 'not_started',
                "started_at": '2019-01-06T20:54:05.714+04:00',
                "completed_at": '2019-01-06T20:54:05.714+04:00'
              }
            ]
          },
          {
            "id": 110,
            "name": 'Thriving Index - Alinma Custom Report',
            "status": 'not_ready',
            "assessments": [
              {
                "id": 91_731,
                "name": 'Thriving Index Assessment - Alinma',
                "status": 'not_started',
                "started_at": '2019-01-06T20:54:05.714+04:00',
                "completed_at": '2019-01-06T20:54:05.714+04:00'
              }
            ]
          }
        ]

        let(:project_id) { project.id }
        let(:user_id) { user.id }

        run_test! do |response|
          reports = JSON.parse(response.body)
          expect(reports.first).to have_key('id')
          expect(reports.first).to have_key('name')
          expect(reports.first).to have_key('status')
          expect(reports.first['assessments'].first['id']).to eq assessment.id
          expect(reports.first['assessments'].first['name']).to eq assessment.name
        end
      end
    end
  end

  path '/projects/{project_id}/users/{user_id}/reports/{report_id}/results' do
    get 'Get user results' do
      operationId 'GetUserResults'
      description 'Assessment results for the user\'s report. '
      tags 'Reports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :report_id, in: :path, type: :string

      response '200', 'Get user report results' do
        schema '$ref' => '#/definitions/ReportResults'
        examples 'application/json' => { 'user_data' => { 'first_name' => 'Spider', 'last_name' => 'Man' },
                                         'assessments' =>
                                          [{ 'id' => 17,
                                             'name' => 'Thriving Index Assessment',
                                             'results' =>
                                              { 'normed_factors' => [
                                                { 'key' => 549, 'name' => 'Accountability', 'value' => nil },
                                                { 'key' => 554, 'name' => 'Efficacy', 'value' => nil }
                                              ],
                                                'ranked_occupations' => [
                                                  { 'key' => 2, 'rank' => 1, 'name' => 'Occupation 2',
                                                    'normed_factors' => [] }, {
                                                      'key' => 1, 'rank' => 2, 'name' => 'Occupation 1',
                                                      'normed_factors' => []
                                                    }
                                                ] } }] }

        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:report_id) { report.id }

        run_test! do |response|
          result = JSON.parse(response.body)
          expect(result['assessments']).to be_an_instance_of(Array)
          expect(result).to have_key('user_data')
        end
      end

      response '403', 'Assessment not completed' do
        schema '$ref' => '#/definitions/ReportResults'
        examples 'application/json' => {
          'code' => 1004,
          'message' => 'Assessment not completed',
          'more_info' => 'Assessments for report 111 are not passed'
        }

        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:report_id) { report.id }

        before do
          assign.project_assign.in_progress!
        end
        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1004,
                                'message' => 'Assessment not completed',
                                'more_info' => "Assessments for report #{report_id} are not passed"
          )
        end
      end
    end
  end

  path '/projects/{project_id}/users/{user_id}/reports/{report_id}/pdf' do
    get 'Get user report PDF' do
      operationId 'GetUserReport'
      description 'Returns the user\'s report PDF url. This url is time-limited,\\
 check the expires_at attribute in the response.'
      tags 'Reports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :report_id, in: :path, type: :string

      response '200', 'Get user report PDF' do
        schema '$ref' => '#/definitions/ReportPdf'
        examples 'application/json' => {
          url: 'https://some.aws.s3.com/report.pdf',
          status: 'ready'
        }

        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:report_id) { report.id }

        run_test! do |response|
          response = JSON.parse(response.body)
          expect(response).to have_key('url')
          expect(response).to have_key('status')
        end
      end
    end
  end

  path '/reports/{report_id}/dimensions' do
    before do
      report.update(owner: membership.client)
    end
    let!(:license) { create(:license, client: membership.client, report_family: report.report_families.first) }

    get 'Get all report dimensions' do
      operationId 'GetReportDimensions'
      description 'Returns all report dimensions. Use `since` param to get records that \\
      have been updated or created after since. Use `include_factors` to include Factors.\\
      Use `include_occupations` to include Occupations'
      tags 'Dimensions'
      consumes 'application/json'
      security [basic: []]
      parameter name: :report_id, in: :path, type: :integer
      parameter name: :since, in: :query, type: :string, required: false,
        description: 'Returns results that have been updated after since.'
      parameter name: :include_occupations, in: :query, type: :string, required: false,
        description: 'true - returns occupations'
      parameter name: :include_factors, in: :query, type: :string, required: false,
        description: 'true - returns factors'

      response '200', 'Get all report dimensions' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'dimensions': [
            {
              'id': 12,
              'name': 'Dimension Name'
            }
          ],
          'server_time': '2019-10-06T18:25:43.511Z'
        }

        let(:report_id) { report.id }

        run_test! do |response|
          result = JSON.parse(response.body)

          expect(result).to have_key('server_time')
          expect(result).to have_key('dimensions')

          expect(result['dimensions']).to be_an_instance_of(Array)
          expect(result['dimensions']).not_to be_empty
        end
      end

      response '404', 'Raise 404 Not Found if the report is not found' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'code' => 1005,
          'message' => 'Resource not found',
          'more_info' => 'Report with id 123 not found.'
        }

        let(:report_id) { 123 }

        run_test! do |response|
          result = JSON.parse(response.body)
          expect(result).to eq(
            'code' => 1005,
            'message' => 'Resource not found',
            'more_info' => "Report with id #{report_id} not found."
          )
        end
      end

      response '200', 'Get report dimensions with occupations' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'dimensions': [
            {
              'id': 12,
              'name': 'Dimension name',
              'occupations': [
                {
                  'id': 123,
                  'name': 'Occupation Name',
                  'description': 'Lorem ipsum dolor sit amet.',
                  'updated_at': '2019-10-06T18:25:43.511Z'
                }
              ]
            }
          ],
          'server_time': '2019-10-03T18:25:43.511Z'
        }

        let(:report_id) { report.id }
        let(:include_occupations) { true }

        run_test! do |response|
          result = JSON.parse(response.body)

          expect(result).to have_key('server_time')
          expect(result).to have_key('dimensions')

          expect(result['dimensions']).to be_an_instance_of(Array)
          expect(result['dimensions']).not_to be_empty

          interesting_dimension = result['dimensions'].find { |d| d['id'] == dimension.id }
          expect(interesting_dimension).to have_key('occupations')
          expect(interesting_dimension['occupations']).to be_an_instance_of(Array)
          skip 'To be fixed with data configuration in report factory'
          expect(interesting_dimension['occupations'].length).to eq(2)
        end
      end

      response '200', 'Get report dimensions with occupations since updated_at' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'dimensions': [
            {
              'id': 12,
              'name': 'Dimension name',
              'occupations': [
                {
                  'id': 123,
                  'name': 'Occupation Name',
                  'description': 'Lorem ipsum dolor sit amet.',
                  'updated_at': '2019-10-06T18:25:43.511Z'
                }
              ]
            }
          ],
          'server_time': '2019-10-03T18:25:43.511Z'
        }

        before do
          occupation = dimension.occupations.first
          occupation.update(updated_at: Time.now + 10.minutes)
        end

        let(:report_id) { report.id }
        let(:include_occupations) { true }
        let(:since) { (Time.now + 10.minutes).utc.iso8601 }

        run_test! do |response|
          result = JSON.parse(response.body)

          expect(result).to have_key('server_time')
          expect(result).to have_key('dimensions')

          expect(result['dimensions']).to be_an_instance_of(Array)
          expect(result['dimensions']).not_to be_empty

          interesting_dimension = result['dimensions'].find { |d| d['id'] == dimension.id }
          expect(interesting_dimension).to have_key('occupations')
          expect(interesting_dimension['occupations']).to be_an_instance_of(Array)
          skip 'To be fixed with data configuration in report factory'
          expect(interesting_dimension['occupations'].length).to eq(1)
        end
      end

      before do
        create(:factor, dimension: dimension)
        create(:factor, dimension: dimension)

        config = {
          sections: [{
            data: [
              { type: 'normed_factor', factorId: dimension.factors.first.id, assessmentId: assessment.id },
              { type: 'normed_factor', factorId: dimension.factors.last.id, assessmentId: assessment.id }
            ]
          }]
        }
        report.update(owner: project, data_configuration: config)
      end

      response '200', 'Get report dimensions with factors' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'dimensions': [
            {
              'id': 12,
              'name': 'Dimension Name',
              'factors': [
                {
                  'id': 123,
                  'name': 'Factor Name',
                  'description': 'Lorem ipsum dolor sit amet.',
                  'updated_at': '2019-10-06T18:25:43.511Z'
                }
              ]
            }
          ],
          'server_time': '2019-10-06T18:25:43.511Z'
        }

        let(:report_id) { report.id }
        let(:include_factors) { true }

        run_test! do |response|
          result = JSON.parse(response.body)

          expect(result).to have_key('server_time')
          expect(result).to have_key('dimensions')

          expect(result['dimensions']).to be_an_instance_of(Array)
          expect(result['dimensions']).not_to be_empty

          interesting_dimension = result['dimensions'].find { |d| d['id'] == dimension.id }
          expect(interesting_dimension).to have_key('factors')
          expect(interesting_dimension['factors']).to be_an_instance_of(Array)
          expect(interesting_dimension['factors'].length).to eq(2)
        end
      end

      response '200', 'Get all report dimensions with factors since the updated_at' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'dimensions': [
            {
              'id': 12,
              'name': 'Dimension name',
              'factors': [
                {
                  'id': 123,
                  'name': 'Factor Name',
                  'description': 'Lorem ipsum dolor sit amet.',
                  'updated_at': '2019-10-06T18:25:43.511Z'
                }
              ]
            }
          ],
          'server_time': '2019-10-06T18:25:43.511Z'
        }

        before do
          factor = dimension.factors.first
          factor.update(updated_at: Time.now + 10.minutes)
        end

        let(:report_id) { report.id }
        let(:include_factors) { true }
        let(:since) { (Time.now + 10.minutes).utc.iso8601 }

        run_test! do |response|
          result = JSON.parse(response.body)

          expect(result).to have_key('server_time')
          expect(result).to have_key('dimensions')

          expect(result['dimensions']).to be_an_instance_of(Array)
          expect(result['dimensions']).not_to be_empty

          interesting_dimension = result['dimensions'].find { |d| d['id'] == dimension.id }
          expect(interesting_dimension).to have_key('factors')
          expect(interesting_dimension['factors']).to be_an_instance_of(Array)
          skip 'To be fixed with data configuration in report factory'
          expect(interesting_dimension['factors'].length).to eq(1)
        end
      end

      response '412', 'Raise 412 Not Configured if the report doesn\'t have data configuration' do
        schema '$ref' => '#/definitions/Dimensions'
        examples 'application/json' => {
          'code' => 1007,
          'message' => 'Resource not configured.',
          'more_info' => 'Report with id 12 doesn\'t have data configuration.'
        }

        before do
          report.update(data_configuration: {})
        end

        let(:report_id) { report.id }
        let(:include_factors) { true }

        run_test! do |response|
          result = JSON.parse(response.body)
          expect(result).to eq(
            'code' => 1007,
            'message' => 'Resource not configured.',
            'more_info' => "Report with id #{report_id} doesn't have data configuration."
          )
        end
      end
    end
  end
end
