# frozen_string_literal: true

module EndUser
  class WorkshopInvitedSubjectSerializer < Panko::Serializer
    attributes :id, :title, :description, :duration, :status, :workshop_invite_id

    delegate :title, :description, to: :workshop_invite

    def duration
      workshop_invite.workshops.first&.duration || 0
    end

    def workshop_invite
      @workshop_invite ||= object.workshop_invite
    end
  end
end
