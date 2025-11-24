# frozen_string_literal: true

module CampaignReports
  class ToggleUserAccess < BaseCommand
    private_attr_reader :campaign, :campaign_report, :toggle_user_access

    def initialize(campaign_report, toggle_user_access)
      @campaign_report = campaign_report
      @toggle_user_access = toggle_user_access
      @campaign = campaign_report.campaign
    end

    def call
      campaign_report.toggle!(:user_access)

      if toggle_user_access
        user_reports = campaign.user_reports.where(report_id: campaign_report.report_id)

        user_reports.update_all(user_access: campaign_report.user_access)

        if campaign_report.user_access && !user_reports.empty?
          UserReports::ScheduleReportAvailableNotificationJob.perform_later(user_reports.pluck(:id))
        end
      end
    end
  end
end
