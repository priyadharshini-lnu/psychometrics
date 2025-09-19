# frozen_string_literal: true

module MeetingRooms
  class Workshop
    private_attr_reader :workshop

    def initialize(workshop)
      @workshop = workshop
    end

    def get_role(current_user)
      return 'owner' if current_user.accessible_records(::Workshop, 'workshops.view').exists?(id: workshop.id)

      return 'attendee' if workshop.workshop_assessors.exists?(user_id: current_user.id)

      return 'attendee' if workshop.workshop_subjects.find_by(user: current_user)

      'none'
    end

    def meeting_room_name
      workshop.name
    end

    def video_recording_enabled?
      campaign = workshop.campaign
      campaign&.campaign_options&.enable_video_call_recording || false
    end

    def assessors
      workshop.workshop_assessors.includes(:user).map(&:user)
    end

    def participants
      workshop.workshop_subjects.includes(:user).map(&:user)
    end
  end
end
