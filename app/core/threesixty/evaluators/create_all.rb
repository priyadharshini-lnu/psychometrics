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
          create_membership(evaluator_user)
          create_participant(evaluator, evaluator_user)
        end
        broadcast :ok, result
      end

      def fetch_or_create_evaluator_user(evaluator)
        return evaluator[:evaluator_user] if evaluator[:evaluator_user]

        ::Users::Regular.create_with(first_name: evaluator[:evaluator_first_name],
                                     last_name: evaluator[:evaluator_last_name],
                                     create_by_invite: true).
                         find_or_create_by!(email: evaluator[:evaluator_email], project: project)
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
        threesixty_campaign.participants.find_or_create_by!(
          evaluator: evaluator_user,
          subject: evaluator[:subject_user]) do |participant|
            participant.manager_nomination_status = :approved
            participant.relationship = evaluator[:relationship]
            participant.project_id = threesixty_campaign.campaign.project_id
          end
      end

      private

      attr_reader :evaluators, :threesixty_campaign, :project

      def create_membership(user)
        threesixty_campaign.project.memberships.find_or_create_by!(user_id: user.id)
      end
    end
  end
end
