# frozen_string_literal: true

require 'rails_helper'

describe CampaignReports::BulkDownload do
  let(:campaign) { create(:campaign) }
  let(:report) { create(:report) }
  let(:current_user) { create(:user) }
  let(:job_record) { create(:admin_job_record) }
  let(:campaign_reports) { create_list(:campaign_report, 2, campaign: campaign, report: report) }
  let!(:user_reports_with_pdf) do
    create_list(
      :user_report,
      2,
      :with_pdf,
      campaign: campaign,
      report: report,
      status: 'prepared'
    ).each do |user_report|
      create(:campaign_user, user: user_report.user, campaign: user_report.campaign, active: true)
    end
  end
  let!(:inactive_user_report_with_pdf) do
    create(:user_report, :with_pdf, campaign: campaign, report: report, status: 'prepared').tap do |user_report|
      create(:campaign_user, user: user_report.user, campaign: user_report.campaign, active: false)
    end
  end
  let!(:assessments) do
    [*user_reports_with_pdf, inactive_user_report_with_pdf].map do |user_report|
      create(:user_assessment,
             subject_id: user_report.user.id,
             campaign_id: campaign.id,
             assessment_id: user_report.report.assessment.id,
             completed_at: 1.day.ago)
    end
  end

  it 'create bulk_download record' do
    expect do
      described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
    end.to change(BulkReport, :count).by(1)
  end

  it 'creates input directory' do
    input_dir = 'tmp/reports'
    allow_any_instance_of(BulkReport).to receive(:input_dir).and_return(input_dir)
    allow(BulkReports::CompressJob).to receive(:perform_now)
    expect(FileUtils).to receive(:mkdir_p).with(input_dir)

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'calls ::BulkReports::CompressJob' do
    expect(BulkReports::CompressJob).to receive(:perform_now)

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'sends BulkReport mail' do
    expect(BulkReportMailer).to receive_message_chain(:notify, :deliver_later)

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'returns error message if no user_reports with pdf' do
    user_report = create(:user_report, campaign: campaign, report: report)

    user_reports = UserReport.where(id: user_report.id)

    expect(
      described_class.call!(
        user_reports: user_reports, current_user: current_user, job_record: job_record
      )
    ).to eq({ error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')] })
  end

  it 'calls download report for each user_report which have pdf' do
    start_date = 2.days.ago.utc.iso8601(3)
    end_date = 1.day.ago.utc.iso8601(3)

    user_report_without_pdf = create(:user_report, campaign: campaign, report: report)

    job_record.data['start_date'] = start_date
    job_record.data['end_date'] = end_date
    job_record.save!

    expect_any_instance_of(described_class).to receive(:download_report).with(user_reports_with_pdf[0])
    expect_any_instance_of(described_class).to receive(:download_report).with(user_reports_with_pdf[1])
    expect_any_instance_of(described_class).to_not receive(:download_report).with(user_report_without_pdf)

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'ignores inactive users user_report by default' do
    expect_any_instance_of(described_class).to receive(:download_report).with(user_reports_with_pdf[0])
    expect_any_instance_of(described_class).to receive(:download_report).with(user_reports_with_pdf[1])
    expect_any_instance_of(described_class).to_not receive(:download_report).with(inactive_user_report_with_pdf)

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'includes inactive users user_report when include_inactive_users param is true' do
    job_record.data['include_inactive_users'] = true
    job_record.save!

    expect_any_instance_of(described_class).to receive(:download_report).with(user_reports_with_pdf[0])
    expect_any_instance_of(described_class).to receive(:download_report).with(user_reports_with_pdf[1])
    expect_any_instance_of(described_class).to receive(:download_report).with(inactive_user_report_with_pdf)

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end
end
