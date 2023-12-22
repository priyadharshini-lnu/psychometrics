# frozen_string_literal: true

module Threesixty
  module Emails
    class SendScheduledEmails < BaseCommand
      def call
        Threesixty::Emails::MergeMultipleEvaluatorEmailSchedules.call!

        Threesixty::EmailSchedule.where(delivered_at: nil, processing_started_at: nil).
          where('scheduled_date <= ?', Time.zone.now).
          find_each do |schedule_email|
            Threesixty::Emails::SendSingleScheduledEmail.call!(schedule_email)
        rescue StandardError => e
          Sentry.capture_exception(e)
          end
      end
    end
  end
end
