# frozen_string_literal: true

module ReportApproving
  class QcNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(user_report_id, user)
      @user = user
      @user_report = UserReport.find_by(id: user_report_id)
      send_email(
        user,
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        subject: @user_report.change_requested? ? 'Report changes requested' : 'Report ready for QC',
        template_path: 'mailer/report_approving',
        template_name: 'qc_notification'
      )
    end
  end
end
