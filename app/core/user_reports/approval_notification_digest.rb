# frozen_string_literal: true

module UserReports
  class ApprovalNotificationDigest < BaseCommand
    def initialize(report_ids, campaign_id, report_id)
      @report_ids = report_ids
      @approval_settings = ReportApprovalSetting.find_by(campaign_id: campaign_id, report_id: report_id)
    end

    def call
      approval_notification_user_ids = @approval_settings&.approval_notification_user_ids
      return if approval_notification_user_ids.blank?

      approval_notification_user_ids.each do |user_id|
        ::ReportApproving::ApprovalNotificationDigestMailer.notify(@report_ids, user_id).deliver_later
      end
    end
  end
end
