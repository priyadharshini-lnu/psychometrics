# frozen_string_literal: true

module EndUser
  class BookingsSerializer < ActiveModel::Serializer
    attributes :id, :title, :description, :duration, :status, :workshop_invite_id, :date,
               :timezone, :cancellation_lead_time, :reason

    delegate :duration, :timezone, :cancellation_lead_time, to: :workshop, allow_nil: true

    delegate :title, :description, to: :workshop_invite

    def date
      workshop&.start_time&.iso8601
    end

    def workshop_invite
      @workshop_invite ||= object.workshop_invite
    end

    def workshop
      @workshop ||= WorkshopSubject.find_by(
        user_id: current_user.id,
        campaign_id: object.workshop_invite.campaign_id
      )&.workshop
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
