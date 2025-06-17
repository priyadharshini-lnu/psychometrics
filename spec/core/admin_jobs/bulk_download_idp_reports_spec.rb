# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::BulkDownloadIdpReports do
  let!(:campaign) { create(:campaign) }
  let!(:superadmin) { create(:superadmin) }
  let!(:job_record) do
    create(:admin_job_record, operation: :bulk_download_idp_reports, owner: superadmin,
           data: { campaign_id: campaign.id, lang: 'en' })
  end
  let(:idp_template) { create(:idp_template) }
  let(:idp_user) { create(:user) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: idp_user, idp_template: idp_template, active: true, status: 'draft',
            campaign_id: campaign.id)
  end

  describe '#perform' do
    before do
      allow(AdminJobs::BulkDownloadIdpReports).to receive(:validate).and_return(nil)
    end

    it 'should create and run sub job' do
      allow(AdminJob).to receive(:perform_later) do |*args|
        AdminJob.perform_now(*args)
      end

      expect(AdminJobSteps::BulkDownloadIdpReports::GenerateJob).to receive(:perform_now)
      expect(AdminJobSteps::BulkDownloadIdpReports::DownloadJob).to_not receive(:perform_now)
      expect do
        AdminJob.call(:bulk_download_idp_reports, { campaign_id: campaign.id, lang: 'en' }, superadmin)
      end.to change { AdminJobRecord.count }.by(2)
    end

    it 'should run first step generate' do
      expect(AdminJobSteps::BulkDownloadIdpReports::GenerateJob).to receive(:perform_now)
      expect(AdminJobSteps::BulkDownloadIdpReports::DownloadJob).to_not receive(:perform_now)
      expect do
        AdminJob.perform_now(job_record)
      end.to change { AdminJobRecord.count }.by(1)
    end

    it 'should run second step download' do
      expect(AdminJobSteps::BulkDownloadIdpReports::DownloadJob).to receive(:perform_now)
      expect(AdminJobSteps::BulkDownloadIdpReports::GenerateJob).to_not receive(:perform_now)

      expect do
        AdminJob.perform_now(job_record, 'download')
      end.to change { AdminJobRecord.count }.by(1)
    end

    it 'should create multiple job records' do
      allow(AdminJob).to receive(:perform_later) do |*args|
        AdminJob.perform_now(*args)
      end

      expect(AdminJobSteps::BulkDownloadIdpReports::GenerateJob).to receive(:perform_now)
      expect(AdminJobSteps::BulkDownloadIdpReports::DownloadJob).to receive(:perform_now)

      expect do
        record = AdminJob.call(:bulk_download_idp_reports, { campaign_id: campaign.id, lang: 'en' }, superadmin)
        AdminJob.call_subjob(record, 'download')
      end.to change { AdminJobRecord.count }.by(3)
    end

    it 'should run automatically next job once first completed' do
      allow(AdminJob).to receive(:perform_later) do |*args|
        AdminJob.perform_now(*args)
      end

      expect(AdminJobSteps::BulkDownloadIdpReports::GenerateJob).to receive(:perform_now)
      expect(AdminJobSteps::BulkDownloadIdpReports::DownloadJob).to receive(:perform_now)

      expect do
        record = AdminJob.call(:bulk_download_idp_reports, { campaign_id: campaign.id, lang: 'en' }, superadmin)
        sub_job = record.reload.subjobs.first
        sub_job.increment_completed_tasks!
      end.to change { AdminJobRecord.count }.by(3)
    end
  end

  describe '#validate' do
    it 'should not raise error if no existing job' do
      AdminJobRecord.delete_all
      expect do
        AdminJobs::BulkDownloadIdpReports.validate({ campaign_id: campaign.id, lang: 'en' }, superadmin)
      end.not_to raise_error
    end

    it 'should raise AlreadyExistsError if job already exists' do
      AdminJobRecord.create!(operation: :bulk_download_idp_reports, owner: superadmin,
                             data: { campaign_id: campaign.id, lang: 'en' }, status: :in_progress)

      expect do
        AdminJobs::BulkDownloadIdpReports.validate({ campaign_id: campaign.id, lang: 'en' }, superadmin)
      end.to raise_error(AdminJob::AlreadyExistsError)
    end
  end
end
