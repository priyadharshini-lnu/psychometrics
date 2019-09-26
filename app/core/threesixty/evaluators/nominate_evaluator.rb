# frozen_string_literal: true

module Threesixty
  module Evaluators
    class NominateEvaluator < BaseCommand
      attr_reader :subject, :threesixty_campaign, :params, :project, :user

      def initialize(threesixty_campaign, subject, params, user = nil)
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.project
        @subject = subject
        @params = params
        @user = user
      end

      def call
        ActiveRecord::Base.transaction do
          @user = create_evaluator_user unless user
          ensure_create_campaigns_user(user)
          create_membership(user)
          ensure_create_evaluator(user)
        end

        broadcast :ok, create_participant(user)
      end

      def create_evaluator_user
        ::Users::Regular.create_with(first_name: '', last_name: '', create_by_invite: true).
          find_or_create_by!(email: params[:evaluator_email].downcase, project: project)
      end

      def ensure_create_campaigns_user(evaluator_user)
        CampaignsUser.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def ensure_create_evaluator(evaluator_user)
        ::Threesixty::Evaluator.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def create_membership(user)
        threesixty_campaign.project.memberships.find_or_create_by!(user_id: user.id)
      end

      def create_participant(evaluator_user)
        @subject.participants.create!(
          evaluator_id: evaluator_user.id,
          project_id: threesixty_campaign.campaign.project_id,
          campaign: threesixty_campaign.campaign,
          subject_id: subject.user_id,
          relationship_id: params[:relationship_id],
          manager_nomination_status: manager_nomination_status
        )
      end

      def manager_nomination_status
        return :approved unless manager_can_approve_evaluation?

        Relationship.manager_relationship.id == params[:relationship_id] ? :approved : :waiting
      end

      def manager_can_approve_evaluation?
        threesixty_campaign.option.participants.dig('manager', 'can_approve_nominations')
      end
    end
  end
end
