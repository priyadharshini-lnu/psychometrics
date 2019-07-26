# frozen_string_literal: true

module Threesixty
  module Emails
    class SendScheduleEmails < BaseCommand
      def call
        Threesixty::ScheduleEmail.where(delivered_at: nil).where("scheduled_date <= ?", Time.now).
          find_each do |schedule_email|
            Threesixty::Emails::SendSingleScheduleEmail.call!(schedule_email)
          end
      end
    end
  end
end
