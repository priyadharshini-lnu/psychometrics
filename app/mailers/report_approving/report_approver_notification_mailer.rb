# frozen_string_literal: true

module ReportApproving
  class ReportApproverNotificationMailer < ApplicationMailer
    layout 'admin_email'

    # rubocop:disable Rails/I18nLocaleTexts
    def notify(user_report, emails)
      @user_report = user_report
      mail(
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        to: emails,
        subject: 'Report approving required',
        template_path: '/mailer/report_approving',
        template_name: 'approver_notification'
      )
    end
    # rubocop:enable all
  end
end
