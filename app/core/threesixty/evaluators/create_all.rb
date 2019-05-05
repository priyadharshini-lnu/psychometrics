# frozen_string_literal: true

module Threesixty
  module Evaluators
    class CreateAll < BaseCommand
      def initialize(evaluators, threesixty_campaign)
        @evaluators = evaluators
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.campaign.project
      end

      def call
        result = evaluators.map do |evaluator|
          campaigns_user = create_campaigns_user(evaluator)
          create_evaluator(evaluator, campaigns_user)
          create_participant(evaluator, campaigns_user)
        end
        broadcast :ok, result
      end

      def create_campaigns_user(evaluator)
        user = evaluator[:evaluator_user] ||
               ::Users::Regular.find_or_create_by(email: evaluator[:evaluator_email], project: project) do |user|
                 user.first_name = evaluator[:evaluator_first_name]
                 user.last_name = evaluator[:evaluator_last_name]
                 user.create_by_invite = true
               end
        CampaignsUser.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
      end

      def create_evaluator(evaluator_attrs, campaigns_user)
        evaluator = ::Threesixty::Evaluator.find_or_create_by!(user: campaigns_user.user, campaign: threesixty_campaign.campaign)
        # TODO: (atanych): any idea with counter cache? We need to count only active_participants (check scope :active)
        evaluator.increment!(:evaluations_count)
        evaluator_attrs[:subject].increment!(:evaluators_count)
      end

      def create_participant(evaluator, campaigns_user)
        ::Participant.create(
          evaluator: campaigns_user.user,
          project_id: threesixty_campaign.campaign.project_id,
          campaign: threesixty_campaign.campaign,
          subject: evaluator[:subject_user],
          relationship: evaluator[:relationship]
        )
      end

      private

      attr_reader :evaluators, :threesixty_campaign, :project
    end
  end
end
