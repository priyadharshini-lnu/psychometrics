# frozen_string_literal: true

module Threesixty
  module Emails
    class RecipientByCriteria < BaseCommand
      attr_reader :threesixty_campaign, :email_name, :recipient_criteria

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @email_name = options[:email_name]
        @recipient_criteria = options[:recipient_criteria]
      end

      def call
        if recipient_criteria.nil?
          participatables = []
          participatables << threesixty_campaign.subjects.to_a  if participatable_types.include?(:subject)
          participatables << threesixty_campaign.evaluators.to_a  if participatable_types.include?(:evaluator)
        else
          participatables = participatables || ::Threesixty::ParticipatableByCriteria::Filter.call!(
            threesixty_campaign: threesixty_campaign,
            participatable_types: participatable_types,
            participatables: participatables,
            criteria_list: recipient_criteria
          )
        end

        broadcast :ok, participatables.flatten.map(&:user).uniq
      end

      private

      def participatables
        # TODO: Modify this to return only valid participants for email
        if email_name == 'subject_reminder'
          threesixty_campaign.subjects
        elsif 'evaluator_reminder'
          threesixty_campaign.evaluators
        end
      end

      def participatable_types
        return [:subject, :evaluator] if email_name == 'custom_message'
        return [:subject] if ['subject_invite', 'subject_reminder'].include?(email_name)
        [:evaluator]
      end
    end
  end
end
