# frozen_string_literal: true

require 'rails_helper'

describe Projects::BulkDownload do
  let(:project)      { create(:project) }
  let(:current_user) { create(:superadmin) }
  let(:report)       { create(:report) }
  let(:campaign)     { create(:campaign, project: project) }
  let!(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }

  let(:job_record) do
    create(:admin_job_record,
           operation: :project_bulk_download_reports,
           owner: current_user,
           data: {
             'project_id' => project.id,
             'campaign_ids' => [campaign.id],
             'selected_reports' => { report.id.to_s => ['en'] },
             'start_date' => 2.weeks.ago.iso8601,
             'end_date' => Time.zone.now.iso8601,
             'include_inactive_users' => false
           })
  end

  # Helpers to build stubbed user reports with a pdf_path
  def stub_user_report(user:, campaign:, report:, locale: 'en')
    user_report = instance_double(
      UserReport,
      id: rand(100_000),
      report_id: report.id,
      campaign: campaign,
      user: user,
      report: report,
      pdf_path: "private/projects/#{project.id}/user_reports/#{rand(1000)}/#{locale}/report.pdf",
      effective_default_language: locale
    )
    allow(user_report).to receive(:report).and_return(report)
    user_report
  end

  before do
    # Prevent actual FaaS / zip calls
    allow(Faas::ZipS3Files).to receive(:call!)
    allow(Projects::BulkDownloadWithoutFaas).to receive_message_chain(:new, :call)
    allow(Settings.features).to receive(:zip_s3_files_faas).and_return(false)
  end

  describe '#call' do
    context 'when no user reports with PDFs exist' do
      before do
        allow_any_instance_of(described_class).to receive(:collect_user_reports).and_return([])
      end

      it 'broadcasts :ok with an error message' do
        result = described_class.call(current_user: current_user, job_record: job_record)

        expect(result[:ok]).to include(
          error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')]
        )
      end

      it 'still creates a BulkReportJob record so the user can see the error' do
        expect do
          described_class.call(current_user: current_user, job_record: job_record)
        end.to change(BulkReportJob, :count).by(1)
      end
    end

    context 'when user reports with PDFs exist' do
      let(:user) { create(:user) }
      let(:campaign_groups) do
        [{
          campaign_name: campaign.name,
          file_entries: [{
            s3FilePath: 'private/projects/1/user_reports/1/en/report.pdf',
            zipOutputFilePath: "#{campaign.name}/#{user.email}/report-lan-en.pdf",
            _user_report: stub_user_report(user: user, campaign: campaign, report: report),
            _locale: 'en'
          }]
        }]
      end

      before do
        allow_any_instance_of(described_class).to receive(:collect_user_reports).and_return(campaign_groups)
      end

      it 'creates a BulkReport record' do
        expect do
          described_class.call(current_user: current_user, job_record: job_record)
        end.to change(BulkReport, :count).by(1)
      end

      it 'creates a BulkReportJob record linked to the project' do
        expect do
          described_class.call(current_user: current_user, job_record: job_record)
        end.to change(BulkReportJob, :count).by(1)

        expect(BulkReportJob.last.project_id).to eq(project.id)
      end

      it 'stores bulk_report_id and bulk_report_job_id in the job_record data' do
        described_class.call(current_user: current_user, job_record: job_record)

        job_record.reload
        expect(job_record.data['bulk_report_id']).to eq(BulkReport.last.id)
        expect(job_record.data['bulk_report_job_id']).to eq(BulkReportJob.last.id)
      end

      context 'when zip_s3_files_faas is disabled' do
        before { allow(Settings.features).to receive(:zip_s3_files_faas).and_return(false) }

        it 'calls BulkDownloadWithoutFaas' do
          expect(Projects::BulkDownloadWithoutFaas).to receive_message_chain(:new, :call)
          described_class.call(current_user: current_user, job_record: job_record)
        end

        it 'broadcasts :ok with the bulk_report' do
          result = described_class.call(current_user: current_user, job_record: job_record)
          expect(result[:ok]).to be_a(BulkReport)
        end
      end

      context 'when zip_s3_files_faas is enabled' do
        before { allow(Settings.features).to receive(:zip_s3_files_faas).and_return(true) }

        it 'calls Faas::ZipS3Files for each batch' do
          expect(Faas::ZipS3Files).to receive(:call!).at_least(:once)
          described_class.call(current_user: current_user, job_record: job_record)
        end

        it 'broadcasts :waiting' do
          result = described_class.call(current_user: current_user, job_record: job_record)
          expect(result).to have_key(:waiting)
        end

        it 'updates total_tasks on the job_record to match batch count' do
          described_class.call(current_user: current_user, job_record: job_record)
          expect(job_record.reload.total_tasks).to be >= 1
        end
      end
    end

    context 'when all campaign groups have empty file_entries' do
      before do
        allow_any_instance_of(described_class).to receive(:collect_user_reports).and_return(
          [{ campaign_name: 'Empty', file_entries: [] }]
        )
      end

      it 'broadcasts :ok with an error message' do
        result = described_class.call(current_user: current_user, job_record: job_record)
        expect(result[:ok]).to include(
          error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')]
        )
      end
    end
  end

  describe 'zip_output_path' do
    it 'uses safe_folder_name for the campaign folder' do
      command = described_class.new(current_user: current_user, job_record: job_record)
      user = create(:user, email: 'user@example.com')
      report_double = double('Report', name: 'Assessment Report')
      campaign_double = double('Campaign', name: 'Cohort/2026 — Naïve')
      user_report = double('UserReport', user: user, report: report_double, campaign: campaign_double)

      path = command.send(:zip_output_path, user_report, 'en')

      # Campaign name must be filesystem-safe
      expect(path).to start_with('Cohort-2026_Naive/')
      expect(path).to include('user@example.com/')
      expect(path).to end_with('-lan-en.pdf')
    end
  end
end
