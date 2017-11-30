module Communications
  class NotCompletedJob < NotStartedJob
    def perform(communication_id)
      super(communication_id)
    end

    private

    def fetch_memberships(communication)
      communication.current_memberships.member.joins(:assigns).where.not(assigns: { status: :completed }).distinct
    end
  end
end
