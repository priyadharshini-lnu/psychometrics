# frozen_string_literal: true

module Threesixty
  class DeniedNominationMailer < ApplicationMailer
    def send(subject)
      email_template = EmailTemplate.find_by(name: 'denied_nomination')
      mail(
          from: "#{email_template.from} <no-reply@#{Settings.domain}>",
          to: subject.email,
          reply_to: email_template.reply_to_email,
          subject: email_template.subject,
          body: email_template.content,
          content_type: "text/html",
      )
    end
  end
end
