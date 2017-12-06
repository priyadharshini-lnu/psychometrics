module Communications
  module ReminderType
    class InProgressJob < NotStartedJob
      def perform(communication_id)
        super(communication_id)
      end

      private

      def fetch_memberships(communication)
        communication.current_memberships.member_or_manager.
          joins(:assigns).where(assigns: { status: :in_progress }).distinct
      end
    end
  end
end
