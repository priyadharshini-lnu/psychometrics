module Communications
  class SendNowJob < ApplicationJob
    queue_as :communication

    def perform(communication_id)
      @communication = Communication.enabled.find_by(id: communication_id)
      return unless @communication
      memberships = fetch_memberships
      memberships.each do |membership|
        @communication.emails.create(membership_id: membership.id)
      end
    end

    private

    def fetch_memberships
      @communication.current_memberships.distinct
    end
  end
end
