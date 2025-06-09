# frozen_string_literal: true

module EndUser
  class WorkshopInviteSerializer < Panko::Serializer
    attributes :id, :title, :description, :duration, :total_invites, :campaign_assessment_group_id

    def duration
      object.workshops&.first&.duration || 0
    end

    def total_invites
      WorkshopInvitedSubject.
        joins(workshop_invite: [workshops: :campaign_assessment_group]).
        where(
          user_id: current_user.id,
          workshop_invites: { campaign_id: object.campaign_id },
          workshops: { campaign_assessment_group_id: campaign_assessment_group_id }
        ).count
    end

    def campaign_assessment_group_id
      object.workshops&.first&.campaign_assessment_group_id
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
