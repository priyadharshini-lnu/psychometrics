# frozen_string_literal: true

module UserReports
  class NotifyApprovals < BaseCommand
    def initialize(user_report)
      @user_report = user_report
      ids = user_report.campaign.report_approval_settings.find_by(report_id: user_report.report_id)&.
            approval_notification_user_ids
      @users = User.where(id: ids, project_id: nil)
    end

    def call
      @users.each do |user|
        ::ReportApproving::ReportApprovalNotificationMailer.notify(@user_report, user).deliver_later
      end
    end
  end
end
