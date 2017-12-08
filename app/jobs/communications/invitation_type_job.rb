module Communications
  class InvitationTypeJob < ApplicationJob
    queue_as :communication

    def perform(communication)
      memberships = fetch_memberships(communication)
      memberships.each do |membership|
        communication.emails.create(membership_id: membership.id)
      end
    end

    private

    def fetch_memberships(communication)
      communication.current_memberships.distinct
    end
  end
end
