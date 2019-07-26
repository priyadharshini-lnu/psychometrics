# frozen_string_literal: true

module Threesixty
  module Emails
    class SendSingleScheduleEmail < BaseCommand
      private_attr_reader :schedule_email, :threesixty_campaign

      def initialize(schedule_email)
        @schedule_email = schedule_email
        @threesixty_campaign = schedule_email.threesixty_campaign
      end

      def call
        User.where(id: schedule_email.recipient_ids).each do |recipient|
          send_email(recipient)
        end
        schedule_email.update(delivered_at: Time.now)
      end

      private

      def send_email(recipient)
        recipient_type = get_recipient_type(schedule_email.name)
        context = { :recipient => recipient, threesixty_campaign: threesixty_campaign }
        context.merge!({ recipient_type => recipient }) if recipient_type

        other_participator = recipient_type == :subject ? :evaluator : :subject

        if user_ids = schedule_email.meta["#{other_participator}_ids"].presence
          User.where(id: user_ids).each do |user|
            context[other_participator] = user
            Threesixty::ScheduleEmailMailer.send_email(schedule_email, context).deliver_later
          end
        else
          Threesixty::ScheduleEmailMailer.send_email(schedule_email, context).deliver_later
        end
        create_or_update_reminder_history(recipient)
      end

      def get_recipient_type(email_name)
        config = Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == schedule_email[:name] }
        config&.dig(:recipient_type)
      end

      def create_or_update_reminder_history(recipient)
        reminder_history = threesixty_campaign.reminder_histories.find_or_create_by!(
          user_id: recipient.id,
          email_name: schedule_email.name
        )
        reminder_history.sent_count += 1
        reminder_history.last_sent_at = Time.now
        reminder_history.save!
      end
    end
  end
end
