# frozen_string_literal: true

class PlatformExceptionMonitorMailer < ApplicationMailer
  layout 'admin_email'

  def send_platform_exception_suppressed_notification(emails, exception_tracker_record)
    @exception_tracker = exception_tracker_record
    # rubocop:disable CustomRubocops/AvoidDirectUseOfMailMethod
    mail(
      from: Branding.mail_from("no-reply@#{Settings.domain}"),
      to: emails,
      subject: "[#{ENV.fetch('REAL_ENV', nil)}] Platform exception surfacing threshold exceeded",
      template_path: 'mailer/platform',
      template_name: 'platform_exception_surfacing_notification'
    )
    # rubocop:enable CustomRubocops/AvoidDirectUseOfMailMethod
  end
end
