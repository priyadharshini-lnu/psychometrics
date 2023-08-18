# frozen_string_literal: true

module ReportApproving
  class QcNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(user_report, user)
      @user = user
      @user_report = user_report
      mail(
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        to: user.email,
        subject: @user_report.change_requested? ? 'Report changes requested' : 'Report ready for QC',
        template_path: 'mailer/report_approving',
        template_name: 'qc_notification'
      )
    end
  end
end
