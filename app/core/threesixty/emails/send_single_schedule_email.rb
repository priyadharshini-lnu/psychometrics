# frozen_string_literal: true

module Threesixty
  module Emails
    class SendSingleScheduleEmail < BaseCommand
      private_attr_reader :schedule_email

      def initialize(schedule_email)
        @schedule_email = schedule_email
      end

      def call
        User.where(id: schedule_email.recipient_ids).each do |recipient_id|
          send_email(schedule_email, recipient)
        end
        schedule_email.update(delivered_at: Time.now)
      end

      private

      def send_email(recipient)
        recipient_type = get_recipient_type(schedule_email.name)
        context = { :recipient => recipient, recipient_type => user }

        other_participator = recipient_type == :subject ? :evaluator : :subject

        if user_ids = schedule_email.meta["#{other_participator}_ids"].presence
          User.where(id: user_ids).each do |user|
            context[other_participator] = user
            Threesixty::ScheduleEmailMailer.send(schedule_email, context).deliver_later
          end
        else
          Threesixty::ScheduleEmailMailer.send(schedule_email, context).deliver_later
        end
        create_or_update_reminder_history(recipient, schedule_email.name)
      end

      def get_recipient_type(email_name)
        Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == schedule_email[:name] }[:recipient_type]
      end

      def create_or_update_reminder_history(recipient, schedule_email)
        reminder_history = threesixty_campaign.reminder_histories.find_or_create_by!(
          user: recipient,
          email_name: schedule_email.name
        )
        reminder_history.sent_count += 1
        reminder_history.last_sent_at = Time.now
        reminder_history.save!
      end

      def threesixty_campaign
        schedule_email.threesixty_campaign
      end
    end
  end
end
