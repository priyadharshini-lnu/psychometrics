# frozen_string_literal: true

module ReportApproving
  class ReportApprovalNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(user_report, user)
      @user_report = user_report
      @user = user
      send_email(
        user,
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        subject: 'Report approved',
        template_path: 'mailer/report_approving',
        template_name: 'approval_notification'
      )
    end
  end
end
