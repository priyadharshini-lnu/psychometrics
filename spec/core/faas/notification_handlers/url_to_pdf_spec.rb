# frozen_string_literal: true

require 'rails_helper'

describe Faas::NotificationHandlers::UrlToPdf do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user_report) { create(:user_report, campaign: campaign) }
  let!(:user_report_pdf) { create(:user_report_pdf, user_report: user_report) }
  let(:idp_template) { create(:idp_template) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user_report.user, campaign: campaign, idp_template: idp_template)
  end
  let(:admin_job_record) { create(:admin_job_record, operation: :bulk_download_idp_reports, completed_tasks: 0) }
  let(:generaete_job_record) do
    create(:admin_job_record, completed_tasks: 0, step: :generate, parent_job_id: admin_job_record.id)
  end

  it 'updates user_report if update_record is true' do
    allow(Settings).to receive_message_chain(
      :secrets, :s3_compatible_storage, :[]
    ).with(:private_bucket).and_return('s3_private_bucket')

    described_class.call!({
      'record_id' => user_report.id,
      'record_type' => 'UserReport',
      'file_name' => 'example.pdf',
      'update_record' => true,
      'checksum' => '0',
      'file_size' => 0
    })

    expect(user_report.user_report_pdf.pdf_file.filename.to_s).to eq('example.pdf')
  end

  it 'updates idp plan if record_type is UserIdpPlan and call next subjob' do
    allow(Settings).to receive_message_chain(
      :secrets, :s3_compatible_storage, :[]
    ).with(:private_bucket).and_return('s3_private_bucket')
    generaete_job_record.update(total_tasks: 1)
    expect(AdminJob).to receive(:call_subjob).with(admin_job_record, :download)
    expect do
      described_class.call!({
        'record_type' => 'UserIdpPlan', 'record_id' => user_idp_plan.id, 'file_name' => 'idp_report.pdf',
        'update_record' => true, 'checksum' => '0', 'file_size' => 0, 'admin_job_record_id' => generaete_job_record.id
      })
    end.to change { user_idp_plan.report_pdfs.count }.by(1)

    expect(generaete_job_record.reload.completed_tasks).to eq(1)
    expect(generaete_job_record.reload.status).to eq('completed')
    expect(user_idp_plan.report_pdfs.first.pdf_file.filename.to_s).to eq('idp_report.pdf')
  end

  it "doesn't updates user_report if update_record is false" do
    described_class.call!({ 'record_type' => 'UserReport', 'record_id' => user_report.id, 'file_name' => 'abc.pdf',
                            'update_record' => false })

    expect(user_report.reload.read_attribute(:pdf)).to eq(nil)
  end

  it 'increments completed_tasks of admin_job_record if admin_job_record_id is present' do
    described_class.call!({
      'record_type' => 'UserReport', 'record_id' => user_report.id, 'file_name' => 'abc.pdf', 'update_record' => false,
      'admin_job_record_id' => admin_job_record.id
    })

    expect(admin_job_record.reload.completed_tasks).to eq(1)
  end

  it "doesn't raise exception when admin_job_record_id is not present" do
    expect do
      described_class.call!({ 'record_type' => 'UserReport', 'record_id' => user_report.id, 'file_name' => 'abc.pdf' })
    end.to_not raise_exception
  end

  it 'broadcast notification to use if notify_user_id is present' do
    allow(Settings).to receive_message_chain(
      :secrets, :s3_compatible_storage, :[]
    ).with(:private_bucket).and_return('s3_private_bucket')

    presigned_url = 'https://presigned_url.cc'
    allow_any_instance_of(ActiveStorage::Blob).to receive(:url).and_return('https://presigned_url.cc')

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
      'record_type' => 'UserReport', 'record_id' => user_report.id, 'file_name' => 'abc.pdf', 'update_record' => true,
      'notify_user_id' => user_report.user_id, 'file_path' => 'upload/abc.pdf', 'checksum' => '0', 'file_size' => 0
    })
  end

  it 'update async request' do
    allow(Settings).to receive_message_chain(
      :secrets, :s3_compatible_storage, :[]
    ).with(:private_bucket).and_return('s3_private_bucket')

    allow_any_instance_of(ActiveStorage::Blob).to receive(:url).and_return('https://presigned_url.cc')
    allow_any_instance_of(UserIdpPlan).to receive(:pdf_url).and_return('url/to/idp_report.pdf')

    response = AsyncResponseRequest::AsyncResponse.new(processing_status: :completed,
                                                       async_request_uuid: 'abcd',
                                                       response_data: 'https://presigned_url.cc',
                                                       response_type: :json)

    expect(AsyncResponseRequest::SetAsyncResponse).to receive(:call!).with(
      async_response: response
    )
    described_class.call!({
      'record_type' => 'UserIdpPlan', 'record_id' => user_idp_plan.id, 'file_name' => 'abc.pdf',
      'update_record' => true, 'file_path' => 'upload/abc.pdf', 'checksum' => '0', 'file_size' => 0,
      'async_request_uuid' => 'abcd', 'lang' => 'en', 'include_reflective_questions' => true
    })
  end
end
