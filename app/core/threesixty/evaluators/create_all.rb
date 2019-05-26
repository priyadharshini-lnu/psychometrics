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
          evaluator_user = fetch_or_create_evaluator_user(evaluator)
          create_campaigns_user(evaluator_user)
          create_evaluator(evaluator, evaluator_user)
          create_participant(evaluator, evaluator_user)
        end
        broadcast :ok, result
      end

      def fetch_or_create_evaluator_user(evaluator)
        return evaluator[:evaluator_user] if evaluator[:evaluator_user]

        ::Users::Regular.create_with(first_name: evaluator[:evaluator_first_name],
                                     last_name: evaluator[:evaluator_last_name],
                                     create_by_invite: true).
                         find_or_create_by(email: evaluator[:evaluator_email], project: project)
      end

      def create_campaigns_user(evaluator_user)
        CampaignsUser.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def create_evaluator(evaluator_attrs, evaluator_user)
        evaluator = ::Threesixty::Evaluator.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
        # TODO: (atanych): any idea with counter cache? We need to count only active_participants (check scope :active)
        evaluator.increment!(:evaluations_count)
        evaluator_attrs[:subject].increment!(:evaluators_count)
      end

      def create_participant(evaluator, evaluator_user)
        ::Participant.create(
          evaluator: evaluator_user,
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
