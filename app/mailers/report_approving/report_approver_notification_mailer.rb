# frozen_string_literal: true

module ReportApproving
  class ReportApproverNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(user_report, user)
      @user_report = user_report
      @user = user

      send_email(
        user,
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        subject: 'Report approving required',
        template_path: 'mailer/report_approving',
        template_name: 'approver_notification'
      )
    end
  end
end
