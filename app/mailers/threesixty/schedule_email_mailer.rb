# frozen_string_literal: true

module Threesixty
  class ScheduleEmailMailer < ApplicationMailer
    def send_email(schedule_email, context)
      body = Threesixty::PipedText::Perform.call!(schedule_email.content, context)
      mail(
          from: "#{schedule_email.from} <no-reply@#{Settings.domain}>",
          to: context[:recipient].email,
          reply_to: schedule_email.reply_to_email,
          subject: schedule_email.subject,
          body: body,
          content_type: "text/html",
      )
    end
  end
end
