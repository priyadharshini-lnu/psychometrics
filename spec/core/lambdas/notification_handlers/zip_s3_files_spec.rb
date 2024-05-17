# frozen_string_literal: true

require 'rails_helper'

describe Lambdas::NotificationHandlers::ZipS3Files do
  let(:bulk_report) { create(:bulk_report) }
  let(:admin_job_record) { create(:admin_job_record) }

  context 'status is completed' do
    it 'updates file_name' do
      described_class.call!({ 'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'status' => 'completed' })

      expect(bulk_report.reload.read_attribute(:files)[0]).to eq('abc.pdf')
    end

    it 'sends bulk report email' do
      expect(BulkReportMailer).to receive_message_chain(:notify, :deliver_later)

      described_class.call!({ 'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'status' => 'completed' })
    end

    it 'marks admin_job completed' do
      described_class.call!({
        'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'admin_job_record_id' => admin_job_record.id,
        'status' => 'completed'
      })
      admin_job_record.reload

      expect(admin_job_record.completed?).to eq(true)
      url = Utility::Url.generate(:download_administration_bulk_report_url, id: bulk_report.id)
      expect(admin_job_record.content).to eq("<a href=\"#{url}\">abc.pdf</a>")
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
