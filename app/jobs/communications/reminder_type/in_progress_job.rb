# frozen_string_literal: true

module Communications
  module ReminderType
    class InProgressJob < NotStartedJob
      private

      def fetch_memberships(communication)
        communication.current_memberships.member_or_manager.
          joins(:assigns).where(assigns: { status: :in_progress }).distinct
      end

      def fetch_campaign_users(communication)
        communication.campaign_users_not_recently_invited.where(completion_status: :in_progress)
      end
    end
  end
end
