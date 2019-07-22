# frozen_string_literal: true

module Threesixty
  module Emails
    class RecipientByCriteria < BaseCommand
      attr_reader :threesixty_campaign, :email_name, :recipient_criteria

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @email_name = options[:email_name]
        @recipient_criteria = options[:recipient_criteria]
        add_default_criteria
      end

      def call
        if recipient_criteria.nil?
          results = []
          results << threesixty_campaign.subjects.to_a  if participatable_types.include?(:subject)
          results << threesixty_campaign.evaluators.to_a  if participatable_types.include?(:evaluator)
        else
          results = ::Threesixty::ParticipatableByCriteria::Filter.call!(
            threesixty_campaign: threesixty_campaign,
            participatable_types: participatable_types,
            criteria_list: recipient_criteria
          )
        end

        broadcast :ok, participatables.flatten.map(&:user).uniq
      end

      private

      def add_default_criteria
        if email_name == Threesixty::Emails::Name::SUBJECT_REMINDER
          recipient_criteria << { 'field' => 'subject_status', 'value' => Threesixty::Participants::GetStatus::NOT_COMPLETED }]
        end
        if email_name == Threesixty::Emails::Name::EVALUATOR_REMINDER
          recipient_criteria << { 'field' => 'by_evaluations', 'value' => 'not_completed' }
        end
      end

      def participatable_types
        return [:subject, :evaluator] if email_name == Threesixty::Emails::Name::CUSTOM_MESSAGE
        return [:subject] if [Threesixty::Emails::Name::SUBJECT_REMINDER, Threesixty::Emails::Name::SUBJECT_INVITE].include?(email_name)
        [:evaluator]
      end
    end
  end
end
