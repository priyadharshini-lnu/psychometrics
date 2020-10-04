# frozen_string_literal: true

module Communications
  class InvitationTypeJob < ApplicationJob
    queue_as :communication

    def perform(communication)
      memberships = fetch_memberships(communication)
      memberships.each do |membership|
        if communication.project.migrated?
          communication.emails.create(campaign_user_id: membership.id)
        else
          communication.emails.create(membership_id: membership.id)
        end
      end
    end

    private

    def fetch_memberships(communication)
      communication.not_invited_to_project_current_memberships
    end
  end
end
