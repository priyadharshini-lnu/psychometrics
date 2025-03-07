# frozen_string_literal: true

module UserReports
  class NotifyApprovers < BaseCommand
    def initialize(user_report)
      @user_report = user_report
      ids = user_report.campaign.report_approval_settings.find_by(report_id: user_report.report_id)&.
            approver_user_ids
      @users = User.where(id: ids, project_id: nil)
    end

    def call
      @users.each do |user|
        ::ReportApproving::ReportApproverNotificationMailer.notify(@user_report, user).deliver_later
      end
    end
  end
end
