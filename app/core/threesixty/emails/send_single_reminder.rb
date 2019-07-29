# frozen_string_literal: true

module Threesixty
  module Emails
    class SendSingleReminder < BaseCommand
      private_attr_reader :email_template, :email_name, :threesixty_campaign

      def initialize(email_template)
        @email_template = email_template
        @threesixty_campaign = email_template.threesixty_campaign
        @email_name = email_template.name
      end

      def call
        return unless reminder_rules = email_template.meta['reminder_rules'].presence

        times = 0
        reminder_rules.each do |rule|
          next if rule['days'].nil? || rule['times'].nil?

          times += rule['times']
          handle_reminder_rule(rule['days'], times)
        end
      end

      private

      def handle_reminder_rule(days, times)
        users_for_reminders.each do |participator|
          reminder_history = reminder_histories["#{participator.id}-#{email_template.name}"]

          if reminder_history.nil? || user_eligible_for_reminder?(reminder_history, days, times)
            send_email(participator)
          end
        end
      end

      def user_eligible_for_reminder?(reminder_history, days, times)
        return if reminder_history.sent_count >= times

        Date.today == reminder_history.last_sent_at.to_date.advance(days: days)
      end

      def reminder_histories
        @reminder_histories ||= threesixty_campaign.
          reminder_histories.
          each_with_object({}) do |reminder_history, acc|
            acc["#{reminder_history.user_id}-#{reminder_history.email_name}"] = reminder_history
          end
      end

      def users_for_reminders
        @users_for_reminders ||= {}
        return @users_for_reminders[email_name] if @users_for_reminders[email_name]
        @users_for_reminders[email_name] ||= Threesixty::Emails::RecipientByCriteria.call!(
          threesixty_campaign: threesixty_campaign,
          email_name: email_name
        )
      end

      def send_email(user)
        if email_name == ::Threesixty::Emails::Name::SUBJECT_REMINDER
          Threesixty::Emails::Send.call!(
            email_name,
            threesixty_campaign: threesixty_campaign,
            recipient_ids: [user.id]
          )
        elsif email_name == ::Threesixty::Emails::Name::EVALUATOR_REMINDER
          Threesixty::Emails::Send.call!(
            email_name,
            threesixty_campaign: threesixty_campaign,
            subject_ids: subject_with_incomplete_evaluation(user),
            recipient_ids: [user.id]
          )
        end
      end

      def subject_with_incomplete_evaluation(user)
        evaluation_completed_for_subject = user.
          evaluation_results.
          completed.
          actual_by_options(threesixty_campaign.option).
          pluck(:subject_id)

        all_subject_ids = threesixty_campaign.participants.where(evaluator_id: user.id).pluck(:subject_id)
        all_subject_ids - evaluation_completed_for_subject
      end
    end
  end
end
