# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::DataReportJobsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client_admin) { create(:client_admin, :with_membership_client_admin) }
  let!(:project) { create(:project, parent: client_admin.clients.first) }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:data_report) { create(:data_report, owner: project.client) }
  let(:data_report_id) { data_report.id }
  let!(:data_report_job) { create(:data_report_job, data_report: data_report, created_by: client_admin) }
  let(:data_report_job_id) { data_report_job.id }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  describe 'as client admin' do
    before do
      sign_in(client_admin)
    end

    path '/data_reports/{data_report_id}/data_report_jobs' do
      get 'DataReportJob List' do
        operationId 'DataReports'
        description 'Fetch data report jobs list'
        tags 'DataReportJob'
        consumes 'application/json'
        security [basic: []]
        parameter name: :include, in: :query, type: :string
        parameter name: :data_report_id, in: :path, type: :string

        response '200', 'Campaign factor list' do
          schema '$ref' => '#/components/schemas/DataReporJobtMultipleResponse'

          let(:include) { 'created_by' }

          run_test! do |response|
            drj = JSON.parse(response.body)['data']

            expect(drj.size).to eq(1)
            expect(drj.first).to have_attribute(:status).with_value('in_progress')
          end
        end
      end
    end

    path '/data_reports/{data_report_id}/data_report_jobs/{data_report_job_id}/get_password' do
      get 'DataReportsJobJob show password' do
        operationId 'DataReportsJob'
        description 'Data Report Job show password'
        tags 'DataReportJob'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :data_report_job_id, in: :path, type: :string
        parameter name: :data_report_id, in: :path, type: :string

        response '200', 'Campaign factor list' do
          schema '$ref' => '#/components/schemas/DataReportPasswordResponse'

          run_test! do |response|
            dr = JSON.parse(response.body)

            expect(dr['password']).to eq(data_report_job.password)
          end
        end
      end
    end
  end
end
