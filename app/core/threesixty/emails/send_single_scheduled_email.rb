# frozen_string_literal: true

module Threesixty
  module Emails
    class SendSingleScheduledEmail < BaseCommand
      private_attr_reader :schedule_email, :recipient_type, :threesixty_campaign

      def initialize(schedule_email)
        @schedule_email = schedule_email
        @recipient_type = Threesixty::Emails::Name.recipient_type(schedule_email.name)
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
        context = { recipient: recipient, threesixty_campaign: threesixty_campaign }
        context[recipient_type] = recipient if recipient_type

        other_participator_type = recipient_type == :subject ? :evaluator : :subject

        if (user_ids = get_other_participators(recipient, other_participator_type))
          User.where(id: user_ids).each do |user|
            context[other_participator_type] = user
            create_email_history(context)
            Threesixty::ScheduleEmailMailer.send_email(schedule_email, context).deliver_later
          end
        else
          create_email_history(context)
          Threesixty::ScheduleEmailMailer.send_email(schedule_email, context).deliver_later
        end
        create_or_update_reminder_history(recipient)
      end

      def create_or_update_reminder_history(recipient)
        return unless Threesixty::Emails::Name.reminder_email?(schedule_email.name)

        reminder_history = threesixty_campaign.reminder_histories.find_or_create_by!(
          user_id: recipient.id,
          email_name: schedule_email.name
        )
        reminder_history.sent_count += 1
        reminder_history.last_sent_at = Time.now
        reminder_history.save!
      end

      def create_email_history(context)
        threesixty_campaign.email_histories.create!(
          subject_id: context[:subject]&.id,
          evaluator_id: context[:evaluator]&.id,
          threesixty_email_schedule_id: schedule_email.id,
          status: :success,
          meta: meta_data_for_email_history(context)
        )
      end

      def meta_data_for_email_history(context)
        return {} if recipient_type == :subject

        relationship_id = threesixty_campaign.
                          participants.
                          find_by(subject_id: context[:subject]&.id, evaluator_id: context[:evaluator]&.id)&.
          relationship_id

        { relationship_id: relationship_id }
      end

      def get_other_participators(user, other_participator_type)
        other_participator_ids = schedule_email.meta["#{other_participator_type}_ids"].presence
        return other_participator_ids if other_participator_ids

        if Threesixty::Emails::Name.evaluator_email?(schedule_email.name) && schedule_email.meta['subject_ids'].blank?
          Threesixty::Evaluators::GetSubjectIdsWithoutEvaluation.call!(threesixty_campaign, user)
        end
      end
    end
  end
end
