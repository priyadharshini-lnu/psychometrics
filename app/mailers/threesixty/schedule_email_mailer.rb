# frozen_string_literal: true

module Threesixty
  class ScheduleEmailMailer < ApplicationMailer
    def send_email(schedule_email)
      schedule_email.recipient_emails.each do |recipient_email|
        mail(
            from: "#{schedule_email.from} <no-reply@#{Settings.domain}>",
            to: recipient_email,
            reply_to: schedule_email.reply_to_email,
            subject: schedule_email.subject,
            body: schedule_email.content,
            content_type: "text/html",
        )
      end
      schedule_email.update(delivered_at: Time.now)
    end
  end
end
