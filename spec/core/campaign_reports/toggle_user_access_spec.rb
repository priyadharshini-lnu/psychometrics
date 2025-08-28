# frozen_string_literal: true

require 'rails_helper'

describe CampaignReports::ToggleUserAccess do
  let(:campaign) { create(:campaign) }
  let(:report) { create(:report) }
  let(:campaign_report) { create(:campaign_report, campaign: campaign, report: report, user_access: false) }
  let!(:user_report) { create(:user_report, campaign: campaign, report: report, user_access: false) }
  let!(:another_user_report) { create(:user_report, campaign: campaign, user_access: false) }

  before do
    allow(UserReports::ScheduleReportAvailableNotificationJob).to receive(:perform_later)
  end

  it 'toggles only campaign_report user_access if toggle_user_access flag is false' do
    described_class.call!(campaign_report, false)

    expect(campaign_report.reload.user_access).to be_truthy
    expect(user_report.reload.user_access).to be_falsy
    expect(UserReports::ScheduleReportAvailableNotificationJob).
      to have_received(:perform_later).
      with(campaign.id, campaign_report.report_id)
  end

  it 'toggles campaign_report and user_reports user_access if toggle_user_access flag is true' do
    described_class.call!(campaign_report, true)

    expect(campaign_report.reload.user_access).to be_truthy
    expect(user_report.reload.user_access).to be_truthy
    expect(UserReports::ScheduleReportAvailableNotificationJob).
      to have_received(:perform_later).
      with(campaign.id, campaign_report.report_id)
  end

  it 'do not toggles user_reports user_access associated with different report if toggle_user_access flag is true' do
    described_class.call!(campaign_report, true)
    expect(another_user_report.reload.user_access).to be_falsy
    expect(UserReports::ScheduleReportAvailableNotificationJob).
      to have_received(:perform_later).
      with(campaign.id, campaign_report.report_id)
  end

  it 'do not changes user_reports user_access if its already similar to toggled value of campaign_report user_access' do
    campaign_report1 = create :campaign_report, campaign: campaign, report: report, user_access: true

    described_class.call!(campaign_report1, true)
    expect(campaign_report1.reload.user_access).to be_falsy
    expect(user_report.reload.user_access).to be_falsy
    expect(UserReports::ScheduleReportAvailableNotificationJob).
      to have_received(:perform_later).
      with(campaign.id, campaign_report1.report_id)
  end
end
