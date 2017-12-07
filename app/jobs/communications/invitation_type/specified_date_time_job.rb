module Communications
  module InvitationType
    class SpecifiedDateTimeJob < ApplicationJob
      queue_as :communication

      def perform(communication_id)
        @communication = Communication.enabled.invitation.find_by(id: communication_id)
        return unless @communication
        memberships = fetch_memberships
        memberships.each do |membership|
          @communication.emails.create(membership_id: membership.id)
        end
      end

      private

      def fetch_memberships
        memberships = @communication.current_memberships.distinct
        memberships = memberships.reject { |membership| membership.user.invitation_accepted? } unless @communication.invitation?
        memberships
      end
    end
  end
end
