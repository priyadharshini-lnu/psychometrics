# frozen_string_literal: true

require 'rails_helper'

describe Lambdas::NotificationHandlers::UrlToPdf do
  let(:user_report) { create(:user_report) }
  let(:admin_job_record) { create(:admin_job_record, completed_tasks: 0) }

  it 'updates user_report if update_record is true' do
    described_class.call!({ 'user_report_id' => user_report.id, 'file_name' => 'abc.pdf', 'update_record' => true })

    expect(user_report.reload.read_attribute(:pdf)).to eq('abc.pdf')
  end

  it "doesn't updates user_report if update_record is false" do
    described_class.call!({ 'user_report_id' => user_report.id, 'file_name' => 'abc.pdf', 'update_record' => false })

    expect(user_report.reload.read_attribute(:pdf)).to eq(nil)
  end

  it 'increments completed_tasks of admin_job_record if admin_job_record_id is present' do
    described_class.call!({
      'user_report_id' => user_report.id, 'file_name' => 'abc.pdf', 'update_record' => false,
      'admin_job_record_id' => admin_job_record.id
    })

    expect(admin_job_record.reload.completed_tasks).to eq(1)
  end

  it "doesn't raise exception when admin_job_record_id is not present" do
    expect do
      described_class.call!({ 'user_report_id' => user_report.id, 'file_name' => 'abc.pdf' })
    end.to_not raise_exception
  end

  it 'broadcast notification to use if notify_user_id is present' do
    presigned_url = 'https://presigned_url.cc'
    allow_any_instance_of(Aws::S3::Presigner).to receive(:presigned_url).and_return(presigned_url)
    expect_any_instance_of(ActionCable::Server::Base).to receive(:broadcast).with(
      "notification_channel_for_#{user_report.user_id}",
      type: 'success',
      message: I18n.t('jobs.threesixty.reports.download.message'),
      description: I18n.t(
        'jobs.threesixty.reports.download.description',
        url: presigned_url
      )
    )
    described_class.call!({
      'user_report_id' => user_report.id, 'file_name' => 'abc.pdf', 'update_record' => true,
      'notify_user_id' => user_report.user_id, 'file_path' => 'upload/abc.pdf'
    })
  end
end
