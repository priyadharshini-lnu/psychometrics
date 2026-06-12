# frozen_string_literal: true

module ReportApproving
  class QcNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(user_report_id, user, new_status)
      @user = user
      @user_report = UserReport.find_by(id: user_report_id)
      @project = @user_report.project
      @url = administration_project_new_campaign_url(
        @user_report.project, @user_report.campaign
      ) + "/user_reports/#{@user_report.id}"
      send_email(
        user,
        subject: new_status == :change_requested ? 'Report changes requested' : 'Report ready for QC',
        template_path: 'mailer/report_approving',
        template_name: 'qc_notification',
        **admin_sender_attributes(@user_report.project&.client)
      )
    end
  end
end
