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
      communication.not_invited_to_project_current_memberships
    end
  end
end
