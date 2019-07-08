# frozen_string_literal: true

module Threesixty
  class SubjectReportReadyMailer < ApplicationMailer
    def send_email(subject)
      email_template = EmailTemplate.find_by!(name: 'subject_report_ready')
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
