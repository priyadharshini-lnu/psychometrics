# frozen_string_literal: true

require 'rails_helper'

describe Faas::NotificationHandlers::ZipS3Files do
  include Rails.application.routes.url_helpers

  let(:bulk_report) { create(:bulk_report, :with_attached_file) }
  let(:admin_job_record) { create(:admin_job_record) }

  context 'status is completed' do
    it 'archives file' do
      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'abc.pdf',
        'file_path' => 'spec/fixtures/files/reports/test.pdf',
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })

      expect(bulk_report.reload.files.first.filename).to eq('archive.zip')
    end

    it 'sends bulk report email' do
      expect(BulkReportMailer).to receive_message_chain(:notify, :deliver_later)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'abc.pdf',
        'file_path' => 'spec/fixtures/files/reports/test.pdf',
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })
    end

    it 'marks admin_job completed' do
      url = 'https://presigned_url.cc'
      allow_any_instance_of(ActiveStorage::Blob).to receive(:url).and_return(url)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'abc.pdf',
        'file_path' => 'spec/fixtures/files/reports/test.pdf',
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })
      admin_job_record.reload

      expect(admin_job_record.completed?).to eq(true)
      download_url = bulk_report.reload.public_download_urls.first
      expect(admin_job_record.content).to eq("<a href=\"#{download_url}\">abc.pdf</a>")
    end
  end

  context 'status is not completed' do
    it "doesn't mark admin_job as completed and doesn't send out BulkDownload email" do
      expect(BulkReportMailer).to_not receive(:notify)

      described_class.call!({
        'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'admin_job_record_id' => admin_job_record.id
      })
      admin_job_record.reload

      expect(admin_job_record.completed?).to eq(false)
    end
  end

  it 'marks admin_job as failed if status received is failed' do
    error = 'Some error from lambda'
    described_class.call!({
      'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'admin_job_record_id' => admin_job_record.id,
      'status' => 'failed', 'error' => error
    })
    admin_job_record.reload

    expect(admin_job_record.failed?).to eq(true)
    expect(admin_job_record.error_messages).to eq([error])
  end

  it 'works when bulk_report_id is wrong or not provided' do
    expect { described_class.call!({}) }.to_not raise_exception
    expect { described_class.call!({ 'bulk_report_id' => 100 }) }.to_not raise_exception
  end
end
