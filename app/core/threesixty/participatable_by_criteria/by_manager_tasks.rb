# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByManagerTasks < Base
      private

      def user_matches_criteria?(user)
        criteria_list.any? do |criteria|
          if criteria['value'] == 'not_approved_all_nominations'
            manager_nomination_approval_pending.include?(user.id)
          elsif criteria['value'] == 'not_approved_all_reports'
            managers_evaluation_approval_pending.include?(user.id)
          end
        end
      end

      def managers_evaluation_approval_pending
        managers
          .where(manager_evaluation_status: :waiting)
          .pluck(:evaluator_id)
      end

      def manager_nomination_approval_pending
        managers
          .where(manager_nomination_status: :waiting)
          .pluck(:evaluator_id)
      end

      def managers
        threesixty_campaign
          .participants
          .joins(:relationship)
          .where(evaluator_id: user_ids, relationships: { name: 'Manager' })
      end
    end
  end
end
