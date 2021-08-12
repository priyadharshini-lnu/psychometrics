# frozen_string_literal: true

require 'rails_helper'

describe Lambdas::NotificationHandlers::ZipS3Files do
  let(:bulk_report) { create(:bulk_report) }
  let(:admin_job_record) { create(:admin_job_record) }

  it 'works when bulk_report_id is wrong or not provided' do
    expect { described_class.call!({}) }.to_not raise_exception
    expect { described_class.call!({ 'bulk_report_id' => 100 }) }.to_not raise_exception
  end

  it 'updates file_name' do
    described_class.call!({ 'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf' })

    expect(bulk_report.reload.read_attribute(:files)[0]).to eq('abc.pdf')
  end

  it 'sends bulk report email' do
    expect(BulkReportMailer).to receive_message_chain(:notify, :deliver_later)

    described_class.call!({ 'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf' })
  end

  it 'updates admin_job' do
    described_class.call!({
      'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'admin_job_record_id' => admin_job_record.id
    })
    admin_job_record.reload

    expect(admin_job_record.completed?).to eq(true)
    expect(admin_job_record.content).to eq("<a href=\"#{bulk_report.reload.files[0].url}\">abc.pdf</a>")
  end
end
