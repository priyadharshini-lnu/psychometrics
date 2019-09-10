# frozen_string_literal: true

module Threesixty
  module Emails
    class RecipientByCriteria < BaseCommand
      EVALUATOR_EMAILS = [
        ::Threesixty::Emails::Name::EVALUATOR_INVITE,
        ::Threesixty::Emails::Name::EVALUATOR_REMINDER
      ].freeze

      SUBJECT_EMAILS = [
        ::Threesixty::Emails::Name::SUBJECT_REMINDER,
        ::Threesixty::Emails::Name::SUBJECT_INVITE
      ].freeze

      private_attr_reader :threesixty_campaign, :email_name, :recipient_criteria

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @email_name = options[:email_name]
        @recipient_criteria = add_default_criteria(options[:recipient_criteria] || [])
      end

      def call
        if recipient_criteria.blank?
          results = []
          results += threesixty_campaign.subjects.to_a if participator_types.include?(:subject)
          results += threesixty_campaign.evaluators.to_a if participator_types.include?(:evaluator)
        else
          results = ::Threesixty::ParticipatorByCriteria::Filter.call!(
            threesixty_campaign: threesixty_campaign,
            participator_types: participator_types,
            criteria_list: recipient_criteria,
            email_name: email_name
          )
        end

        broadcast :ok, results.map(&:user).uniq
      end

      private

      def add_default_criteria(recipient_criteria)
        recipient_criteria = add_default_criteria_for_subject_email(recipient_criteria)
        add_default_criteria_for_evaluator_email(recipient_criteria)
      end

      def add_default_criteria_for_subject_email(recipient_criteria)
        if email_name == ::Threesixty::Emails::Name::SUBJECT_REMINDER
          recipient_criteria << {
            'field' => 'subject_status',
            'value' => Threesixty::Participants::GetStatus::NOT_COMPLETED
          }
        end
        recipient_criteria
      end

      def add_default_criteria_for_evaluator_email(recipient_criteria)
        recipient_criteria << { 'field' => 'atleast_one_non_self_evalaution' } if EVALUATOR_EMAILS.include?(email_name)
        if email_name == ::Threesixty::Emails::Name::EVALUATOR_REMINDER
          recipient_criteria << {
            'field' => 'evaluations', 'value' => 'not_completed', 'exclude_self_evaluations' => true
          }
        end
        recipient_criteria
      end

      def participator_types
        return %i[subject evaluator] if email_name == ::Threesixty::Emails::Name::CUSTOM_MESSAGE
        return [:subject] if SUBJECT_EMAILS.include?(email_name)

        [:evaluator]
      end
    end
  end
end
