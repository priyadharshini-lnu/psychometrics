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
        @user = create_evaluator_user unless user
        ensure_create_evaluator(user)
        ensure_create_campaigns_user(user)

        broadcast :ok, create_participant(user)
      end

      def create_evaluator_user
        ::Users::Regular.create_with(first_name: '', last_name: '', create_by_invite: true).
          find_or_create_by(email: params[:evaluator_email], project: project)
      end

      def ensure_create_campaigns_user(evaluator_user)
        CampaignsUser.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def ensure_create_evaluator(evaluator_user)
        ::Threesixty::Evaluator.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def create_participant(evaluator_user)
        @subject.participants.create!(
          evaluator_id: evaluator_user.id,
          project_id: threesixty_campaign.campaign.project_id,
          campaign: threesixty_campaign.campaign,
          subject_id: subject.user_id,
          relationship_id: params[:relationship_id]
        )
      end
    end
  end
end
