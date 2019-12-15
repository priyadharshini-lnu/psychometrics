# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetEvaluatorsWithPendingEvaluations < Rectify::Query
      private_attr_reader :threesixty_campaign, :subject, :option

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @subject = options[:subject]
        @option = threesixty_campaign.option
      end

      def query
        Threesixty::Evaluator.where(
          user_id: evaluator_ids_with_pending_evaluation,
          campaign_id: threesixty_campaign.campaign_id
        )
      end

      private

      def evaluator_ids_with_pending_evaluation
        all_evaluators_ids - evaluator_ids_with_completed_evaluations
      end

      def all_evaluators_ids
        participants = threesixty_campaign.participants.active.actual_by_options(option).
                       where(subject_id: subject.user_id).where.not(evaluator_id: subject.user_id)
        if option.participants.dig('manager', 'can_approve_nominations')
          participants = participants.where(manager_nomination_status: :approved)
        end
        participants.pluck(:evaluator_id)
      end

      def evaluator_ids_with_completed_evaluations
        UsersResult.actual_by_options(option).
          where(subject_id: subject.user_id, status: :completed, campaign_id: threesixty_campaign.campaign_id).
          pluck(:evaluator_id)
      end
    end
  end
end
