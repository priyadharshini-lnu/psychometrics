# frozen_string_literal: true

module Threesixty
  class SendScheduleEmails < BaseCommand
    def call
      Threesixty::ScheduleEmail.
        where(delivered_at: nil).
        where("scheduled_date <= ?", Time.now).
        find_each do |schedule_email|
        Threesixty::ScheduleEmailMailer.send(schedule_email).deliver_later
      end
    end
  end
end
