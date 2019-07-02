# frozen_string_literal: true

module Threesixty
  class ApproveNominationMailer < ApplicationMailer
    def send(manager, subject)
      email_template = EmailTemplate.find_by(name: 'approve_nomination')
      mail(
          from: "#{email_template.from} <no-reply@#{Settings.domain}>",
          to: manager.user.email,
          reply_to: email_template.reply_to,
          subject: email_template.subject,
          body: email_template.content,
          content_type: "text/html",
      )
    end
  end
end
