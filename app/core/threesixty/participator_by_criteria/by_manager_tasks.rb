# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByManagerTasks < Base
      private

      def user_matches_criteria?(user, criteria)
        return managers_evaluation_approval_pending.include?(user.id) if criteria['value'] == 'not_approved_all_reports'

        manager_nomination_approval_pending.include?(user.id) if criteria['value'] == 'not_approved_all_nominations'
      end

      def managers_evaluation_approval_pending
        @managers_evaluation_approval_pending ||= managers.
          where(manager_evaluation_status: :waiting).
          pluck(:evaluator_id)
      end

      def manager_nomination_approval_pending
        @manager_nomination_approval_pending ||= managers.
          where(manager_nomination_status: :waiting).
          pluck(:evaluator_id)
      end

      def managers
        @managers ||= threesixty_campaign.
          participants.
          actual_by_options(threesixty_campaign.option).
          joins(:relationship).
          where(evaluator_id: user_ids, relationships: { name: 'Manager', type: :global })
      end
    end
  end
end
