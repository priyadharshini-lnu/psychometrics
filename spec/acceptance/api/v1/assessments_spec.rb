require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Assessments" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Assessments within particular user and project'
  before { create(:api_key, token: 'token', membership: create(:membership)) }
  before { create(:assessment) }
  authentication :basic, 'token'

  get "/api/v1/projects/:project_id/users/:user_id/assessments" do
    route_summary 'Get the list of assessments'

    context '200' do
      example_request '...' do
        assessments = JSON.parse(response_body)
        expect(assessments.first).to have_key('id')
        expect(assessments.first).to have_key('name')
        expect(assessments.first).to have_key('status')
        expect(status).to eq(200)
      end
    end
  end
end
