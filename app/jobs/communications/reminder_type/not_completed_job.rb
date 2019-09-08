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
    end
  end
end
