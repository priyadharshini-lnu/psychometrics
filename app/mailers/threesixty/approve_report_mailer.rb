# frozen_string_literal: true

module Threesixty
  class ApproveReportMailer < ApplicationMailer
    def send_email(threesixty_campaign, manager, subject)
      email_template = threesixty_campaign.email_templates.find_by!(name: 'approve_report')
      body = Threesixty::PipedText::Perform.call!(
        email_template.content,
        threesixty_campaign: threesixty_campaign,
        recipient: manager.user,
        subject: subject.user
      )
      mail(
        from: "#{email_template.from} <no-reply@#{Settings.domain}>",
        to: manager.email,
        reply_to: email_template.reply_to_email,
        subject: email_template.subject,
        body: body,
        content_type: "text/html",
      )
    end
  end
end
