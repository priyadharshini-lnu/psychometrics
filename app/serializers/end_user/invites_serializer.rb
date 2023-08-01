# frozen_string_literal: true

module EndUser
  class InvitesSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :duration, :status

    delegate :title, :description, to: :workshop_invite

    def duration
      workshop_invite.workshops.first.duration
    end

    def workshop_invite
      @workshop_invite ||= object.workshop_invite
    end
  end
end
