# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DataReportJobsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin, :with_membership_client_admin) }
  let!(:project) { create(:project, parent: client_admin.clients.first) }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:data_report) { create(:data_report, owner: project.client) }
  let(:data_report_id) { data_report.id }
  let!(:data_report_job) { create(:data_report_job, data_report: data_report, created_by: client_admin) }
  let(:data_report_job_id) { data_report_job.id }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  describe 'as client admin' do
    before do
      sign_in(client_admin)
    end

    describe 'GET /data_reports/:data_report_id/data_report_jobs' do
      it 'returns data report jobs list' do
        get "/api/v2/administration/data_reports/#{data_report_id}/data_report_jobs",
            params: { include: 'created_by' },
            headers: { 'Authorization' => authorization }

        expect(response).to have_http_status(:ok)
        drj = JSON.parse(response.body)['data']
        expect(drj.size).to eq(1)
        expect(drj.first).to have_attribute(:status).with_value('in_progress')
      end
    end

    describe 'GET /data_reports/:data_report_id/data_report_jobs/:data_report_job_id/get_password' do
      it 'returns password for data report job' do
        get "/api/v2/administration/data_reports/#{data_report_id}/data_report_jobs/#{data_report_job_id}/get_password",
            headers: { 'Authorization' => authorization }

        expect(response).to have_http_status(:ok)
        response_data = JSON.parse(response.body)
        expect(response_data).to have_key('password')
      end
    end
  end
end
