require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Reports" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Reports within particular user and project'

  let!(:membership) { create(:client_admin_membership) }
  let(:campaign) { create(:campaign, parent: project) }
  before { create(:api_key, token: 'token', membership: membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:user) { create(:user, project: project) }

  before { create(:report) }
  authentication :apiKey, 'token', name: "X-Api-Key"

  get "/api/v1/projects/:project_id/users/:user_id/reports" do
    route_summary 'Get user reports'

    let(:project_id) { project.id }
    let(:user_id) { user.id }
    let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
    before do
      user_membership = create(:membership, client: campaign, user: user)
      user_membership.client.reports = assessment.reports
      user_membership.client.project.reports = assessment.reports
      assign = create(:assign, membership: user_membership, assessment: assessment)

      allow_any_instance_of(AssignsReport).to receive(:use_license) { "nth" }
      create(:assigns_report, report: assessment.reports.first, assign: assign)
    end

    context '200' do
      example_request '...' do
        reports = JSON.parse(response_body)
        expect(reports.first).to have_key('id')
        expect(reports.first).to have_key('name')
        expect(reports.first).to have_key('status')
        expect(reports.first['assessments'].first['id']).to eq assessment.id
        expect(reports.first['assessments'].first['name']).to eq assessment.name
        expect(status).to eq(200)
      end
    end
  end

  get "/api/v1/projects/:project_id/users/:user_id/reports/:report_id/results" do
    route_summary 'Get user results'

    context '200' do
      example_request '...' do
        result = JSON.parse(response_body)
        expect(status).to eq(200)
      end
    end
  end

  get "/api/v1/projects/:project_id/users/:user_id/reports/:report_id/pdf" do
    route_summary 'Get user report PDF'

    context '200' do
      example_request '...' do
        response = JSON.parse(response_body)
        expect(response).to have_key('url')
        expect(status).to eq(200)
      end
    end
  end
end
