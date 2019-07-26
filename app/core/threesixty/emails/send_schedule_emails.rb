# frozen_string_literal: true

module Threesixty
  module Emails
    class SendScheduleEmails < BaseCommand
      def call
        Threesixty::EmailSchedule.where(delivered_at: nil).where("scheduled_date <= ?", Time.now).
          find_each do |schedule_email|
            Threesixty::Emails::SendSingleScheduleEmail.call!(schedule_email)
            rescue => exception
            Raven.capture_exception(exception)
          end
      end
    end
  end
end
