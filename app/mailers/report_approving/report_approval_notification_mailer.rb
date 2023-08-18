# frozen_string_literal: true

module ReportApproving
  class ReportApprovalNotificationMailer < ApplicationMailer
    layout 'admin_email'

    # rubocop:disable Rails/I18nLocaleTexts
    def notify(user_report, user)
      @user_report = user_report
      @user = user
      mail(
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        to: user.email,
        subject: 'Report approved',
        template_path: 'mailer/report_approving',
        template_name: 'approval_notification'
      )
    end
    # rubocop:enable all
  end
end
