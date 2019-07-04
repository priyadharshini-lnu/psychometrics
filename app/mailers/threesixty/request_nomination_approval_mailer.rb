
# frozen_string_literal: true

module Threesixty
  class RequestNominationApprovalMailer < ApplicationMailer
    def send(manager)
      email_template = EmailTemplate.find_by(name: 'request_approval')
      mail(
          from: "#{email_template.from} <no-reply@#{Settings.domain}>",
          to: manager.email,
          reply_to: email_template.reply_to_email,
          subject: email_template.subject,
          body: email_template.content,
          content_type: "text/html",
      )
    end
  end
end
