# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Projects::BulkReportJobsController, type: :controller do
  let(:project)     { create(:project) }
  let(:superadmin)  { create(:superadmin) }
  let(:campaign)    { create(:campaign, project: project) }
  let(:report)      { create(:report) }
  let!(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }

  let(:valid_params) do
    {
      project_id: project.id,
      data: {
        type: 'bulk_report_jobs',
        attributes: {
          campaign_ids: [campaign.id],
          selected_reports: { report.id.to_s => ['en'] },
          start_date: '2026-01-01 00:00',
          end_date: '2026-09-01 23:59',
          include_inactive_users: false
        }
      }
    }
  end

  before do
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
    allow_any_instance_of(Api::Administration::ProjectBulkReportPolicy).
      to receive(:bulk_download?).and_return(true)
  end

  describe 'POST #bulk_download' do
    it 'returns 201 created' do
      allow(AdminJob).to receive(:call).and_return(double(id: 999))

      post :bulk_download, params: valid_params, format: :json

      expect(response).to have_http_status(:created)
    end

    it 'queues a project_bulk_download_reports admin job' do
      expect(AdminJob).to receive(:call).with(
        :project_bulk_download_reports,
        hash_including('project_id' => project.id),
        superadmin
      ).and_return(double(id: 999))

      post :bulk_download, params: valid_params, format: :json
    end

    it 'returns the admin job id and queued status' do
      allow(AdminJob).to receive(:call).and_return(double(id: 42))

      post :bulk_download, params: valid_params, format: :json

      json = response.parsed_body
      expect(json.dig('data', 'id')).to eq('42')
      expect(json.dig('data', 'type')).to eq('bulk_report_jobs')
      expect(json.dig('data', 'attributes', 'status')).to eq('queued')
    end

    it 'passes selected_reports as a hash in the payload' do
      expect(AdminJob).to receive(:call) do |_op, payload, _user|
        expect(payload['selected_reports']).to eq({ report.id.to_s => ['en'] })
        double(id: 1)
      end

      post :bulk_download, params: valid_params, format: :json
    end

    it 'passes start_date and end_date in the payload' do
      expect(AdminJob).to receive(:call) do |_op, payload, _user|
        expect(payload['start_date']).to be_present
        expect(payload['end_date']).to be_present
        double(id: 1)
      end

      post :bulk_download, params: valid_params, format: :json
    end

    it 'audits the queued bulk report job' do
      allow(AdminJob).to receive(:call).and_return(double(id: 999))

      expect(controller).to receive(:audit!).with(
        :project_bulk_download_reports,
        nil,
        hash_including(
          record_type: 'BulkReportJob',
          project: project,
          payload: hash_including(
            'project_id' => project.id,
            'selected_reports' => { report.id.to_s => ['en'] }
          )
        )
      ).and_call_original

      post :bulk_download, params: valid_params, format: :json
    end

    context 'when user is not authorized' do
      before do
        allow_any_instance_of(Api::Administration::ProjectBulkReportPolicy).
          to receive(:bulk_download?).and_return(false)
      end

      it 'returns 403 forbidden' do
        post :bulk_download, params: valid_params, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'GET #download_file' do
    let(:bulk_report_job) { create(:bulk_report_job, project: project, created_by: superadmin) }
    let(:file_url)  { 'https://example.com/bulk-report.zip' }
    let(:file_id)   { '99' }
    let(:filename)  { 'bulk-report.zip' }

    let(:download_params) do
      {
        project_id: project.id,
        id: bulk_report_job.id,
        url: file_url,
        file_id: file_id,
        filename: filename
      }
    end

    before do
      allow_any_instance_of(Api::Administration::ProjectBulkReportPolicy).
        to receive(:download_file?).and_return(true)
      allow(BulkReportJob).to receive(:find_by!).
        with(hash_including(project_id: project.id)).and_return(bulk_report_job)
    end

    it 'redirects to the file url' do
      allow(controller).to receive(:audit!)

      get :download_file, params: download_params

      expect(response).to redirect_to(file_url)
    end

    it 'audits the file download' do
      expect(controller).to receive(:audit!).with(
        :project_bulk_report_file_download,
        bulk_report_job,
        user:    superadmin,
        project: project,
        payload: {
          bulk_report_job_id: bulk_report_job.id,
          file_id: file_id,
          filename: filename
        }
      ).and_call_original

      get :download_file, params: download_params
    end

    it 'returns 404 when url param is missing' do
      get :download_file, params: { project_id: project.id, id: bulk_report_job.id }

      expect(response).to have_http_status(:not_found)
    end
  end
end
