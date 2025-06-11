# frozen_string_literal: true

module EndUser
  class BookingsSerializer < Panko::Serializer
    attributes :id, :title, :description, :duration, :status, :workshop_invite_id, :date,
               :timezone, :cancellation_lead_time, :reason

    delegate :workshop_invite, to: :object
    delegate :duration, :timezone, :cancellation_lead_time, to: :workshop, allow_nil: true

    delegate :title, :description, to: :workshop_invite

    def date
      workshop&.start_time&.iso8601
    end

    def workshop
      current_user.workshop(object.workshop_invite)
    end

    def current_user
      context[:current_user]
    end
  end
end
