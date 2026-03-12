# frozen_string_literal: true

require 'rails_helper'

describe CampaignReports::ProcessExtractedFiles do
  let(:campaign_report) { create(:campaign_report) }
  let(:user) { create(:user, email: 'user@example.com') }
  let!(:admin_job) { create(:admin_job_record, total_tasks: 1, completed_tasks: 0) }
  let!(:user_report) do
    create(:user_report, campaign: campaign_report.campaign, report: campaign_report.report, user: user)
  end
  let!(:user_report_pdf) do
    create(:user_report_pdf, user_report: user_report, locale: user_report.effective_default_language)
  end

  let(:data) do
    {
      'total_files' => 1,
      'pdf_files_map' => {
        'abc.pdf' => {
          'user_report_id' => user_report.id,
          'email' => user.email,
          'file_name' => 'abc.pdf',
          'output_file_path' => 'reports/2026-02-18/report1.pdf'
        }
      },
      'files' => [
        {
          'user_report_id' => user_report.id,
          'report_pdf_id' => user_report_pdf.id,
          'email' => user.email,
          'file_name' => 'abc.pdf',
          'file_path' => 'reports/2026-02-18/report1.pdf',
          'file_size' => 1024,
          'checksum' => 'abc123',
          'content_type' => 'application/pdf'
        }
      ]
    }
  end

  describe '#call' do
    context 'when data is valid' do
      it 'processes extracted files and updates admin job status' do
        allow(Settings).to receive_message_chain(
          :secrets, :s3_compatible_storage, :[]
        ).with(:private_bucket).and_return('s3_private_bucket')

        described_class.call!(campaign_report, data, admin_job)

        expect(user_report_pdf.reload.pdf_file.attached?).to be_truthy
        expect(user_report_pdf.reload.pdf_file.blob.filename.to_s).to eq('abc.pdf')
      end
    end

    context 'when files data is missing' do
      let(:data) { { 'total_files' => 0, 'files' => [] } }

      it 'finalizes admin job with error message' do
        described_class.call!(campaign_report, data, admin_job)

        expect(admin_job.reload.status).to eq('failed')
        expect(admin_job.error_messages).to include(
          I18n.t('administration.campaign_report.bulk_assets_upload.errors.no_file_found_in_extracted_zip')
        )
      end
    end

    context 'when user report is missing for a file' do
      let(:data) do
        {
          'total_files' => 1,
          'files' => [
            {
              'user_report_id' => 999, # Non-existent user report ID
              'email' => 'user@example.com',
              'file_name' => 'abc.pdf',
              'file_path' => 'reports/2026-02-18/report1.pdf'
            }
          ]
        }
      end

      it 'finalizes admin job with error message' do
        described_class.call!(campaign_report, data, admin_job)

        expect(admin_job.reload.status).to eq('failed')
        expect(admin_job.error_messages).to include(
          I18n.t(
            'administration.campaign_report.bulk_assets_upload.errors.missing_user_reports',
            emails: 'user@example.com'
          )
        )
      end
    end
  end
end
