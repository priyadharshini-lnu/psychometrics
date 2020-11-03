# frozen_string_literal: true

module Communications
  module ReminderType
    class NotCompletedJob < NotStartedJob
      def perform(communication)
        super(communication)
      end

      private

      def fetch_memberships(communication)
        communication.current_memberships.member_or_manager.
          joins(:assigns).where.not(assigns: { status: :completed }).distinct
      end

      def fetch_campaign_users(communication)
        communication.selected_campaign_users.
          joins(user_assessments: :users_result).
          where(user_assessments: { campaign_id: communication.campaign_id }).
          where.not(user_assessments: { users_results: { status: :completed } }).
          distinct
      end
    end
  end
end
