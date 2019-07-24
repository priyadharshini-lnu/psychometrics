# frozen_string_literal: true

module Threesixty
  class SendScheduleEmails < BaseCommand
    def call
      Threesixty::ScheduleEmail.
        where(delivered_at: nil).
        where("scheduled_date <= ?", Time.now).
        find_each do |schedule_email|
          schedule_email.recipient_ids.each do |recipient_id|
            recipient = User.find(recipient_id)
            recipient_type = schedule_email.meta['recipient_type']
            context = { :recipient => recipient, recipient_type => user }

            other_participator = recipient_type == :subject ? :evaluator : :subject

            if user_ids = schedule_email.meta["#{other_participator}_ids"].presence
              User.where(id: user_ids).each do |user|
                Threesixty::ScheduleEmailMailer.send(schedule_email, context).deliver_later
              end
            else
              Threesixty::ScheduleEmailMailer.send(schedule_email, context).deliver_later
            end
          end
        end
      end
    end
  end
end
