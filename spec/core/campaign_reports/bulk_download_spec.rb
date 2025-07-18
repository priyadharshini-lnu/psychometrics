# frozen_string_literal: true

require 'rails_helper'

describe CampaignReports::BulkDownload do
  let(:campaign) { create(:campaign) }
  let!(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:current_user) { create(:user) }
  let(:job_record) { create(:admin_job_record, data: { campaign_id: campaign.id }) }
  let(:report1) { create(:report) }
  let(:report2) { create(:report) }
  let!(:campaign_report1) { create(:campaign_report, campaign: campaign, report: report1) }
  let!(:campaign_report2) { create(:campaign_report, campaign: campaign, report: report2) }
  let!(:campaign_reports) { [campaign_report1, campaign_report2] }
  let!(:user_reports_with_pdf) do
    create_list(
      :user_report,
      2,
      campaign: campaign,
      report: report1,
      status: 'prepared'
    ).each do |user_report|
      create(:campaign_user, user: user_report.user, campaign: user_report.campaign, active: true)
      create(:user_report_pdf, :with_pdf, user_report: user_report)
    end
  end
  let!(:inactive_user_report_with_pdf) do
    create(:user_report, campaign: campaign, report: report1, status: 'prepared').tap do |user_report|
      create(:campaign_user, user: user_report.user, campaign: user_report.campaign, active: false)
      create(:user_report_pdf, :with_pdf, user_report: user_report)
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

  before(:each) do
    allow_any_instance_of(described_class).to receive(:download_report)
    allow(BulkReports::CompressJob).to receive(:perform_now)
  end

  it 'create bulk_download record' do
    expect do
      described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
    end.to change(BulkReport, :count).by(1)
  end

  it 'creates input directory' do
    input_dir = 'tmp/reports'
    allow_any_instance_of(BulkReport).to receive(:input_dir).and_return(input_dir)
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
    user_report = create(:user_report, campaign: campaign, report: report1)

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

    user_report_without_pdf = create(:user_report, campaign: campaign, report: report1)

    job_record.data['start_date'] = start_date
    job_record.data['end_date'] = end_date
    job_record.save!
    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[0].pdf_url,
      user_reports_with_pdf[0],
      user_reports_with_pdf[0].report.default_language
    )

    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[1].pdf_url,
      user_reports_with_pdf[1],
      user_reports_with_pdf[1].report.default_language
    )

    expect_any_instance_of(described_class).to_not receive(:download_report).with(
      user_report_without_pdf.pdf_url,
      user_report_without_pdf,
      user_report_without_pdf.report.default_language
    )

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'ignores inactive users user_report by default' do
    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[0].pdf_url,
      user_reports_with_pdf[0],
      user_reports_with_pdf[0].report.default_language
    )

    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[1].pdf_url,
      user_reports_with_pdf[1],
      user_reports_with_pdf[1].report.default_language
    )

    expect_any_instance_of(described_class).to_not receive(:download_report).with(
      inactive_user_report_with_pdf.pdf_url,
      inactive_user_report_with_pdf,
      inactive_user_report_with_pdf.report.default_language
    )

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'includes inactive users user_report when include_inactive_users param is true' do
    job_record.data['include_inactive_users'] = true
    job_record.save!
    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[0].pdf_url,
      user_reports_with_pdf[0],
      user_reports_with_pdf[0].report.default_language
    )

    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[1].pdf_url,
      user_reports_with_pdf[1],
      user_reports_with_pdf[1].report.default_language
    )
    expect_any_instance_of(described_class).to receive(:download_report).with(
      inactive_user_report_with_pdf.pdf_url,
      inactive_user_report_with_pdf,
      inactive_user_report_with_pdf.report.default_language
    )
    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end

  it 'includes user_reports with locales provided in selected_reports with report_id' do
    selected_reports = {
      user_reports_with_pdf[0].report_id.to_s => ['en'],
      user_reports_with_pdf[1].report_id.to_s => ['en']
    }
    job_record.data['selected_reports'] = selected_reports
    job_record.save!

    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[0].pdf_url,
      user_reports_with_pdf[0],
      'en'
    )

    expect_any_instance_of(described_class).to receive(:download_report).with(
      user_reports_with_pdf[1].pdf_url,
      user_reports_with_pdf[1],
      'en'
    )

    described_class.call!(campaign_reports: campaign_reports, current_user: current_user, job_record: job_record)
  end
end
