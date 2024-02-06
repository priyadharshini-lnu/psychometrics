# frozen_string_literal: true

module EndUser
  class WorkshopInvitedSubjectSerializer < Panko::Serializer
    attributes :id, :title, :description, :duration, :status, :workshop_invite_id
    delegate :workshop_invite, to: :object
    delegate :title, :description, to: :workshop_invite

    def duration
      workshop_invite.workshops.first&.duration || 0
    end
  end
end
