require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Reports" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Reports within particular user and project'

  before { create(:report) }

  get "/api/v1/projects/:project_id/users/:user_id/reports" do
    route_summary 'Get user reports'

    context '200' do
      example_request '...' do
        reports = JSON.parse(response_body)
        expect(reports.first).to have_key('id')
        expect(reports.first).to have_key('name')
        expect(reports.first).to have_key('status')
        expect(status).to eq(200)
      end
    end
  end

  get "/api/v1/projects/:project_id/users/:user_id/reports/:report_id/results" do
    route_summary 'Get Result'

    context '200' do
      example_request '...' do
        result = JSON.parse(response_body)
        expect(status).to eq(200)
      end
    end
  end

  get "/api/v1/projects/:project_id/users/:user_id/reports/:report_id/pdf" do
    route_summary 'Get PDF'

    context '200' do
      example_request '...' do
        response = JSON.parse(response_body)
        expect(response).to have_key('url')
        expect(status).to eq(200)
      end
    end
  end
end
