# frozen_string_literal: true

module Communications
  module ReminderType
    class NotCompletedJob < NotStartedJob
      private

      def fetch_memberships(communication)
        communication.current_memberships.member_or_manager.
          joins(:assigns).where.not(assigns: { status: :completed }).distinct
      end

      def fetch_campaign_users(communication)
        communication.campaign_users_not_recently_invited.where.not(completion_status: :completed)
      end
    end
  end
end
