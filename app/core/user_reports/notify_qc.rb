# frozen_string_literal: true

module UserReports
  class NotifyQc < BaseCommand
    def initialize(user_report, new_status)
      @user_report = user_report
      ids = user_report.campaign.report_approval_settings.find_by(report_id: user_report.report_id)&.
            qc_user_ids
      @new_status = new_status
      @users = User.where(id: ids, project_id: nil)
    end

    def call
      @users.each do |user|
        ::ReportApproving::QcNotificationMailer.notify(@user_report.id, user, @new_status).deliver_later
      end
    end
  end
end
