# frozen_string_literal: true

module Threesixty
  module Campaigns
    class RemoveUser < BaseCommand
      def initialize(user, threesixty_campaign)
        @user = user
        @threesixty_campaign = threesixty_campaign
        @campaign = threesixty_campaign.campaign
      end

      def call
        remove_all_participants

        user.user_reports.where(campaign_id: campaign.id).find_each(&:destroy!)
        user.campaign_users.where(campaign_id: campaign.id).find_each(&:destroy!)
        campaign.subjects.where(user_id: user.id).find_each(&:destroy!)
        campaign.evaluators.where(user_id: user.id).find_each(&:destroy!)
      end

      private

      attr_reader :user, :campaign

      def remove_all_participants
        participants = Threesixty::Participant.
                       where(subject_id: user.id, campaign_id: campaign.id).
                       or(
                         Threesixty::Participant.where(evaluator_id: user.id, campaign_id: campaign.id)
                       )
        participants.destroy_all
      end
    end
  end
end
