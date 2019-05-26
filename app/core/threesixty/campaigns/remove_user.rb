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

        user.users_reports.where(campaign_id: campaign.id).destroy_all
        user.evaluation_results.destroy_all
        user.evaluated_results.destroy_all
        user.users_assessments.destroy_all
        user.campaigns_users.where(campaign_id: campaign.id).destroy_all

        campaign.subjects.where(user_id: user.id).destroy_all
        campaign.evaluators.where(user_id: user.id).destroy_all
      end

      private

      attr_reader :user, :campaign

      def remove_all_participants
        participants = Participant.
          where(subject_id: user.id, campaign_id: campaign.id).
          or(
            Participant.where(evaluator_id: user.id, campaign_id: campaign.id)
          )
       participants.destroy_all
      end
    end
  end
end
