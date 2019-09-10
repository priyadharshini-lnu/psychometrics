# frozen_string_literal: true

class BulkReportMailer < ApplicationMailer
  def notify(report)
    @report = report
    @user = report.user

    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: @user.email,
      subject: I18n.t('administration.bulk_reports.mailer.subject'),
      template_path: '/mailer/bulk_report',
      template_name: 'notify'
    )
  end
end
