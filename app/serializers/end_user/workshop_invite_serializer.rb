# frozen_string_literal: true

module EndUser
  class WorkshopInviteSerializer < Panko::Serializer
    attributes :id, :title, :description, :duration, :total_invites

    def duration
      object.workshops&.first&.duration || 0
    end

    def total_invites
      WorkshopInvitedSubject.joins(:workshop_invite).where(
        user_id: current_user.id,
        workshop_invites: { campaign_id: object.campaign_id }
      ).count
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
