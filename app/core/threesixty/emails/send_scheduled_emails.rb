# frozen_string_literal: true

module Threesixty
  module Emails
    class SendScheduledEmails < BaseCommand
      def call
        Threesixty::EmailSchedule.where(delivered_at: nil).where('scheduled_date <= ?', Time.now).
          find_each do |schedule_email|
            Threesixty::Emails::SendSingleScheduledEmail.call!(schedule_email)
        rescue StandardError => e
          Raven.capture_exception(e)
          end
      end
    end
  end
end
