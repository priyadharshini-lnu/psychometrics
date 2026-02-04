# frozen_string_literal: true

module Threesixty
  module Subjects
    class Remove < BaseCommand
      private_attr_reader :threesixty_campaign, :campaign, :updater_id, :subject, :remove_license_usage

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @campaign = options[:threesixty_campaign].campaign
        @updater_id = options[:updater_id]
        @subject = options[:subject]
        @remove_license_usage = options[:remove_license_usage]
      end

      def call
        subject.user_reports.where(campaign_id: campaign.id).find_each(&:destroy!)
        remove_all_participants

        if remove_license_usage
          LicenseManager::Deactivator.call!(
            campaign: threesixty_campaign,
            updater_id: updater_id,
            user_ids_for_deactivation: subject.user_id
          )
        end

        subject.destroy!
      end

      private

      def remove_all_participants
        participants = Threesixty::Participant.
                       where(subject_id: subject.user_id, campaign_id: campaign.id).
                       or(
                         Threesixty::Participant.where(evaluator_id: subject.user_id, campaign_id: campaign.id)
                       )
        participants.map(&:destroy!)
      end
    end
  end
end
