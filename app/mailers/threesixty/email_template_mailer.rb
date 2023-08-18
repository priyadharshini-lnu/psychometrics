# frozen_string_literal: true

module Threesixty
  class EmailTemplateMailer < ApplicationMailer
    layout 'mailer/layouts/end_user_email_without_footer'

    def test_email(email_template, to_email)
      @body = email_template.content
      smtp_setting = email_template.project.smtp_setting
      from_name = email_template.from || smtp_setting.from_name
      from_email = smtp_setting.enabled? && smtp_setting.from_email.presence
      from_email ||= "no-reply@#{Settings.domain}"
      mail(
        from: "#{from_name} <#{from_email}>",
        to: to_email,
        reply_to: email_template.reply_to_email,
        subject: email_template.subject,
        template_path: 'mailer/threesixty/email_template',
        content_type: 'text/html',
        delivery_method_options: smtp_setting.settings_for_email
      )
    end
  end
end
