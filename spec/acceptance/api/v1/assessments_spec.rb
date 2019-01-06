require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Assessments" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Assessments within particular user and project'
  let!(:membership) { create(:client_admin_membership) }
  let(:campaign) { create(:campaign, parent: project) }
  before { create(:api_key, token: 'token', membership: membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:user) { create(:user, project: project) }
  authentication :apiKey, 'token', name: "X-Api-Key"

  get "/api/v1/projects/:project_id/users/:user_id/assessments" do
    route_summary 'Get the list of assessments'
    let(:project_id) { project.id }
    let(:user_id) { user.id }
    before do
      user_membership = create(:membership, client: campaign, user: user)
      assessment = create(:assessment, :with_report, name: 'Super Assessment')
      user_membership.client.reports = assessment.reports
      user_membership.client.project.reports = assessment.reports
      create(:assign, membership: user_membership, assessment: assessment)
    end

    context '200' do
      example_request '...' do
        assessments = JSON.parse(response_body)
        expect(assessments.first['name']).to eq 'Super Assessment'
        expect(assessments.first).to have_key('id')
        expect(assessments.first).to have_key('status')
        expect(status).to eq(200)
      end
    end
  end
end
