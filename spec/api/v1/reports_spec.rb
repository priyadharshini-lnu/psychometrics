require 'rails_helper'
require 'rails_helper'
require 'swagger_helper'

describe 'Reports' do
  let!(:membership) { create(:client_admin_membership) }
  let(:campaign) { create(:campaign, parent: project) }
  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:user) { create(:user, project: project) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
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

  before do
    allow_any_instance_of(AssignsReport).to receive(:use_license) { "nth" }
    create(:assigns_report, report: report, assign: assign)
  end

  path '/projects/{project_id}/users/{user_id}/reports' do

    get 'Get user reports' do
      operationId 'GetUserReports'
      description 'All reports currently assigned to the user. Each report object also contains the required assessments and the user\'s completion status.'
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
            "name": "Thriving Index - Alinma Resource - PRO ",
            "status": "not_ready",
            "assessments": [
                    {
                      "id": 91731,
                      "name": "Thriving Index Assessment - Alinma",
                      "status": "not_started",
                      "started_at": "2019-01-06T20:54:05.714+04:00",
                      "completed_at": "2019-01-06T20:54:05.714+04:00"
                    }
                  ]
          },
          {
            "id": 110,
            "name": "Thriving Index - Alinma Custom Report",
            "status": "not_ready",
            "assessments": [
                    {
                      "id": 91731,
                      "name": "Thriving Index Assessment - Alinma",
                      "status": "not_started",
                      "started_at": "2019-01-06T20:54:05.714+04:00",
                      "completed_at": "2019-01-06T20:54:05.714+04:00"
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
        examples 'application/json' => {"user_data"=>{"first_name"=>"Spider", "last_name"=>"Man"},
                                        "assessments"=>
                                          [{"id"=>17,
                                            "name"=>"Thriving Index Assessment",
                                            "results"=>
                                              {"normed_factors"=>[{"key"=>549, "name"=>"Accountability", "value"=>nil}, {"key"=>554, "name"=>"Efficacy", "value"=>nil}],
                                               "ranked_occupations"=>[{"key"=>2, "rank"=>1, "name"=>"Occupation 2", "normed_factors"=>[]}, {"key"=>1, "rank"=>2, "name"=>"Occupation 1", "normed_factors"=>[]}]}}]}

        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:report_id) { report.id }

        run_test! do |response|
          result = JSON.parse(response.body)
          expect(result["assessments"]).to be_an_instance_of(Array)
          expect(result).to have_key('user_data')
        end
      end


      response '403', 'Assessment not completed' do
        schema '$ref' => '#/definitions/ReportResults'
        examples 'application/json' => {
          "code" => 1004,
          "message" => 'Assessment not completed',
          "more_info" => 'Assessments for report 111 are not passed'
        }

        let(:project_id) { project.id }
        let(:user_id) { user.id }
        let(:report_id) { report.id }

        before do
          assign.project_assign.in_progress!
        end
        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq({
                                "code" => 1004,
                                "message" => 'Assessment not completed',
                                "more_info" => "Assessments for report #{report_id} are not passed"
                              })
        end
      end
    end
    end

  path '/projects/{project_id}/users/{user_id}/reports/{report_id}/pdf' do
    get 'Get user report PDF' do
      operationId 'GetUserReport'
      description 'Returns the user\'s report PDF url. This url is time-limited, check the expires_at attribute in the response.'
      tags 'Reports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :report_id, in: :path, type: :string

      response '200', 'Get user report PDF' do
        schema '$ref' => '#/definitions/ReportPdf'
        examples 'application/json' => {
          url: "https://some.aws.s3.com/report.pdf",
          status: "ready"
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
end
