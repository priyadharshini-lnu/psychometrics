# frozen_string_literal: true

module MeetingRooms
  class UserAssessment
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def get_role(current_user)
      return 'attendee' if current_user.id == user_assessment.subject_id

      workshop_ids = user_assessment.associated_workshops&.pluck(:id)

      return 'none' if workshop_ids.blank?

      return 'owner' if current_user.accessible_records(::Workshop, 'workshops.view').exists?(id: workshop_ids)

      return 'attendee' if WorkshopAssessor.exists?(workshop_id: workshop_ids, user_id: current_user.id)

      'none'
    end

    def meeting_room_name
      user_assessment.subject.name
    end

    def video_recording_enabled?
      campaign = user_assessment.campaign
      campaign&.campaign_options&.enable_video_call_recording || false
    end
  end
end
