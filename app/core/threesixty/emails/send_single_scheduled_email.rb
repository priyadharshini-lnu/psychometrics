# frozen_string_literal: true

module Threesixty
  module Emails
    class SendSingleScheduledEmail < BaseCommand
      private_attr_reader :schedule_email, :threesixty_campaign

      def initialize(schedule_email)
        @schedule_email = schedule_email
        @threesixty_campaign = schedule_email.threesixty_campaign
      end

      def call
        return if schedule_email.scheduled_date.nil? || schedule_email.scheduled_date > Time.now

        User.where(id: schedule_email.recipient_ids).each do |recipient|
          send_email(recipient)
        end
        schedule_email.update(delivered_at: Time.now)
      end

      private

      def send_email(recipient)
        preprocess_email_schedule(recipient)
        recipient_type = get_recipient_type
        context = { recipient: recipient, threesixty_campaign: threesixty_campaign }
        context[recipient_type] = recipient if recipient_type

        other_participator = recipient_type == :subject ? :evaluator : :subject

        if (user_ids = schedule_email.meta["#{other_participator}_ids"].presence)
          User.where(id: user_ids).each do |user|
            context[other_participator] = user
            create_email_history(context)
            Threesixty::ScheduleEmailMailer.send_email(schedule_email, context).deliver_later
          end
        else
          create_email_history(context)
          Threesixty::ScheduleEmailMailer.send_email(schedule_email, context).deliver_later
        end
        create_or_update_reminder_history(recipient)
      end

      # TODO: Repace this with schedule_email.recipient_type
      def get_recipient_type
        config = Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == schedule_email[:name] }
        config&.dig(:recipient_type)
      end

      def create_or_update_reminder_history(recipient)
        return if Threesixty::Emails::Name.reminder_email?(schedule_email.name)

        reminder_history = threesixty_campaign.reminder_histories.find_or_create_by!(
          user_id: recipient.id,
          email_name: schedule_email.name
        )
        reminder_history.sent_count += 1
        reminder_history.last_sent_at = Time.now
        reminder_history.save!
      end

      def create_email_history(context)
        threesixty_campaign.email_histories.create(
          subject_id: context[:subject].id,
          evaluator_id: context[:evaluator].id,
          recipient_type: get_recipient_type,
          email_schedule_id: schedule_email.id
        )
      end

      def preprocess_email_schedule(user)
        if Threesixty::Emails::Name.evaluator_email?(schedule_email.name) && schedule_email.meta['subject_ids'].blank?
          schedule_email.update(meta:
            { subject_ids: Threesixty::Evaluators::GetSubjectIdsWithoutEvaluation.call!(threesixty_campaign, user) })
        end
      end
    end
  end
end
