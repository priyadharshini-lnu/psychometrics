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

  context 'when toggle_user_access flag is false' do
    it 'toggles only campaign_report user_access and does not schedule notification job' do
      described_class.call!(campaign_report, false)

      expect(campaign_report.reload.user_access).to be_truthy
      expect(user_report.reload.user_access).to be_falsy
      expect(UserReports::ScheduleReportAvailableNotificationJob).not_to have_received(:perform_later)
    end
  end

  context 'when toggle_user_access flag is true' do
    context 'when campaign_report user_access becomes true' do
      it 'toggles campaign_report and user_reports user_access and schedules notification job' do
        described_class.call!(campaign_report, true)

        expect(campaign_report.reload.user_access).to be_truthy
        expect(user_report.reload.user_access).to be_truthy
        expect(UserReports::ScheduleReportAvailableNotificationJob).to have_received(:perform_later).
          with([user_report.id])
      end
    end

    context 'when campaign_report user_access becomes false' do
      it 'toggles campaign_report and user_reports user_access but does not schedule notification job' do
        campaign_report.update!(user_access: true)
        user_report.update!(user_access: true)

        described_class.call!(campaign_report, true)

        expect(campaign_report.reload.user_access).to be_falsy
        expect(user_report.reload.user_access).to be_falsy
        expect(UserReports::ScheduleReportAvailableNotificationJob).not_to have_received(:perform_later)
      end
    end

    it 'does not toggle user_reports user_access associated with different report' do
      described_class.call!(campaign_report, true)

      expect(another_user_report.reload.user_access).to be_falsy
      expect(UserReports::ScheduleReportAvailableNotificationJob).to have_received(:perform_later).
        with([user_report.id])
    end

    it 'updates user_reports user_access to match campaign_report user_access regardless of previous state' do
      user_report2 = create(:user_report, campaign: campaign, report: report, user_access: true)

      described_class.call!(campaign_report, true)

      expect(campaign_report.reload.user_access).to be_truthy
      expect(user_report.reload.user_access).to be_truthy
      expect(user_report2.reload.user_access).to be_truthy
      expect(UserReports::ScheduleReportAvailableNotificationJob).to have_received(:perform_later).
        with([user_report.id, user_report2.id])
    end
  end

  context 'when no user_reports exist for the report' do
    it 'does not schedule notification job' do
      UserReport.where(report: report).delete_all

      described_class.call!(campaign_report, true)

      expect(campaign_report.reload.user_access).to be_truthy
      expect(UserReports::ScheduleReportAvailableNotificationJob).not_to have_received(:perform_later)
    end
  end
end
