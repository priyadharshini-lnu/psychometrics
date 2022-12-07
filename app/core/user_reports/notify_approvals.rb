# frozen_string_literal: true

module UserReports
  class NotifyApprovals < BaseCommand
    def initialize(user_report)
      @user_report = user_report
    end

    def call
      emails = [] # Send email to ReportApprovalSetting#approval_notification_user_ids
      ::ReportApproving::ReportApprovalNotificationMailer.notify(@user_report, emails).deliver_later
    end
  end
end
