# frozen_string_literal: true

module Threesixty
  class EmailTemplateMailer < ApplicationMailer
    def test_email(email_template, to_email)
      mail(
        from: "#{email_template.from} <no-reply@#{Settings.domain}>",
        to: to_email,
        reply_to: email_template.reply_to_email,
        subject: email_template.subject,
        body: email_template.content,
        content_type: 'text/html'
      )
    end
  end
end
