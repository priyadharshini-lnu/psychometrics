# frozen_string_literal: true

module Threesixty
  module Evaluators
    class NominateEvaluator < BaseCommand
      private_attr_reader :subject, :threesixty_campaign, :params, :project, :nominator, :evaluator

      def initialize(threesixty_campaign:, subject:, params:, nominator:, evaluator: nil)
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.project
        @subject = subject
        @params = params
        @nominator = nominator
        @evaluator = evaluator
      end

      def call
        ActiveRecord::Base.transaction do
          @evaluator = create_evaluator_user unless evaluator
          ensure_create_campaigns_user
          create_membership
          ensure_create_evaluator
        end

        broadcast :ok, create_participant
      end

      def create_evaluator_user
        ::Users::Regular.create_with(first_name: '', last_name: '', create_by_invite: true).
          find_or_create_by!(email: params[:evaluator_email], project: project)
      end

      def ensure_create_campaigns_user
        CampaignsUser.find_or_create_by!(user: evaluator, campaign: threesixty_campaign.campaign)
      end

      def ensure_create_evaluator
        ::Threesixty::Evaluator.find_or_create_by!(user: evaluator, campaign: threesixty_campaign.campaign)
      end

      def create_membership
        threesixty_campaign.project.memberships.find_or_create_by!(user_id: evaluator.id)
      end

      def create_participant
        @subject.participants.create!(
          evaluator_id: evaluator.id,
          project_id: threesixty_campaign.campaign.project_id,
          campaign: threesixty_campaign.campaign,
          subject_id: subject.user_id,
          relationship_id: params[:relationship_id],
          manager_nomination_status: manager_nomination_status
        )
      end

      def manager_nomination_status
        return :approved if !manager_can_approve_evaluation? || nominator_is_manager?

        Relationship.manager_relationship.id == params[:relationship_id] ? :approved : :waiting
      end

      def manager_can_approve_evaluation?
        threesixty_campaign.option.participants.dig('manager', 'can_approve_nominations')
      end

      def nominator_is_manager?
        Threesixty::Subjects::GetManagers.new(subject: subject).query.where(evaluator_id: nominator.id).exists?
      end
    end
  end
end
