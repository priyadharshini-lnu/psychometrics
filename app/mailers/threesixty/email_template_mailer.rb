# frozen_string_literal: true

module Threesixty
  class EmailTemplateMailer < ApplicationMailer
    def test_email(email_template, to_email)
      smtp_setting = email_template.project.smtp_setting
      from_name = email_template.from || smtp_setting.from_name
      from_email = smtp_setting.enabled? ? smtp_setting.from_email : "no-reply@#{Settings.domain}"
      mail(
        from: "#{from_name} <#{from_email}>",
        to: to_email,
        reply_to: email_template.reply_to_email,
        subject: email_template.subject,
        body: email_template.content,
        content_type: 'text/html',
        delivery_method_options: smtp_setting.settings_for_email
      )
    end
  end
end
