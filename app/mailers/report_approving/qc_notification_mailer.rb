# frozen_string_literal: true

module ReportApproving
  class QcNotificationMailer < ApplicationMailer
    layout 'admin_email'

    # rubocop:disable Rails/I18nLocaleTexts
    def notify(user_report, user)
      @user = user
      @user_report = user_report
      mail(
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        to: user.email,
        subject: 'Report changes requested',
        template_path: '/mailer/report_approving',
        template_name: 'qc_notification'
      )
    end
    # rubocop:enable all
  end
end
