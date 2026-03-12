# frozen_string_literal: true

class BulkReportMailer < ApplicationMailer
  layout 'admin_email'

  def notify(report)
    @report = report
    @user = report.user

    send_email(
      @user,
      subject: I18n.t('administration.bulk_reports.mailer.subject'),
      template_path: 'mailer/bulk_report',
      template_name: 'notify',
      **admin_sender_attributes((@report.campaign&.project || @user.project)&.client)
    )
  end
end
