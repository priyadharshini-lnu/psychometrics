# frozen_string_literal: true

module EndUser
  class WorkshopInvitedSubjectSerializer < Panko::Serializer
    attributes :id, :title, :description, :duration, :status, :workshop_invite_id,
               :slots_count, :seats_available, :meeting_type, :upcoming_slot_date

    delegate :workshop_invite, to: :object
    delegate :title, :description, to: :workshop_invite

    def duration
      workshop_invite.workshops.first&.duration || 0
    end

    def slots_count
      workshop_invite.workshops.size
    end

    def seats_available
      workshop_invite.workshops.sum { |w| w.total_seats - w.booked_seats }
    end

    def meeting_type
      case workshop_invite.workshops.first&.video_call_type
        when 'internal', 'custom' then 'online'
        when 'not_available'      then 'in_person'
      end
    end

    def upcoming_slot_date
      ws = workshop_invite.next_bookable_workshop || workshop_invite.next_future_workshop
      ws&.start_time&.utc&.iso8601
    end
  end
end
