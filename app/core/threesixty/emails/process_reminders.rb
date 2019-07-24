# frozen_string_literal: true

module Threesixty
  module Emails
    class ProcessReminders < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        threesixty_campaign.email_templates.reminders.each do |email_template|
          next unless reminder_rules = email_template.meta["reminder_rules"].presence

          reminder_rules.each do |rule|
            handle_reminder_rule(email_template, rule)
          end
        end
      end

      private

      def handle_reminder_rule(email_template, rule)
        return if rule.days.nil? == rule.times.nil?

        participators_for_reminders(email_template).each do |participator|
          reminder_history = reminder_histories["#{participator.user_id}-#{email_template.name}"]
          if reminder_history.nil? || user_eligible_for_reminder?(rule, reminder_history)
            send_email(email_template, participator)
          end
        end
      end

      def user_eligible_for_reminder?(rule, reminder_history)
        return if reminder_history.sent_count >= rule.times

        Date.today == reminder_history.last_sent_at.advance(date: rule.days)
      end

      def reminder_histories
        @reminder_histories ||= threesixty_campaign.
          reminder_histories.
          where(user_id: users_for_reminders().map(&:id))
          .each_with_object({}) do |reminder_history, acc|
            acc["#{reminder_history.user_id}-#{reminder_history.email_name}"] = reminder_history
          end
      end

      def participators_for_reminders(email_template)
        return @participators_for_reminders[email_template] if @participators_for_reminders[email_template]
        @participators_for_reminders ||= {}
        @participators_for_reminders[email_template] ||= Threesixty::Emails::RecipientByCriteria.call!(threesixty_campaign: threesixty_campaign, email_name: email_template.name)
      end

      def send_email(email_template, participator)
        if email_name == ::Threesixty::Emails::Name::SUBJECT_REMINDER
          Threesixty::Emails::Send.call!(
            email_template.name,
            threesixty_campaign: threesixty_campaign,
            subject: participator
          )
        elsif email_name == ::Threesixty::Emails::Name::EVALUATOR_REMINDER
          Threesixty::Emails::Send.call!(
            email_template.name,
            threesixty_campaign: threesixty_campaign,
            subject_ids: subject_with_incomplete_evaluation(evaluator)
            recipients: [participator]
          )
        end
      end

      def subject_with_incomplete_evaluation(evaluator)
        evaluation_completed_for_subject = evaluator.
          evaluation_results.
          completed.
          actual_by_options(threesixty_campaign.option).
          pluck(:subject_id)

        evaluator.participants.pluck(:subject_id) - evaluation_completed_for_subject
      end
    end
  end
end
