# frozen_string_literal: true

require 'rails_helper'

describe Faas::NotificationHandlers::ProcessCampaignReportBulkAssets do
  let(:campaign_report) { create(:campaign_report) }
  let(:admin_job_record) { create(:admin_job_record) }

  context 'when campaign_report is not found' do
    it 'returns ok without doing anything' do
      expect do
        described_class.call!({
          'campaign_report_id' => -1,
          'admin_job_record_id' => admin_job_record.id,
          'status' => 'completed'
        })
      end.not_to change(admin_job_record.reload, :status)
    end
  end

  context 'when status is failed' do
    it 'marks admin job as failed and purges bulk assets' do
      campaign_report.bulk_assets_zip.attach(
        io: Rails.root.join('spec/fixtures/files/reports/test.pdf').open,
        filename: 'test.pdf'
      )
      error = 'Some error'

      described_class.call!({
        'campaign_report_id' => campaign_report.id,
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'failed',
        'error' => error
      })

      expect(admin_job_record.reload.failed?).to eq(true)
      expect(admin_job_record.error_messages).to include(error)
      expect(campaign_report.reload.bulk_assets_zip.attached?).to eq(false)
    end

    context 'when status is completed' do
      it 'calls CampaignReports::ProcessExtractedFiles' do
        expect(CampaignReports::ProcessExtractedFiles).to receive(:call!).with(campaign_report, {
          'campaign_report_id' => campaign_report.id,
          'admin_job_record_id' => admin_job_record.id,
          'status' => 'completed'
        }, admin_job_record)

        described_class.call!({
          'campaign_report_id' => campaign_report.id,
          'admin_job_record_id' => admin_job_record.id,
          'status' => 'completed'
        })
      end
    end
  end
end
