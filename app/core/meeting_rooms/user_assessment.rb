# frozen_string_literal: true

module MeetingRooms
  class UserAssessment
    private_attr_reader :user_assessment, :current_user

    def initialize(user_assessment, current_user)
      @user_assessment = user_assessment
      @current_user = current_user
    end

    def get_role
      return 'attendee' if current_user.id == user_assessment.subject_id

      workshop = user_assessment.subject.last_workshop(user_assessment.campaign_id)

      return 'none' unless workshop

      return 'owner' if current_user.accessible_records(::Workshop, 'workshops.view').exists?(id: workshop.id)

      return 'attendee' if workshop.workshop_assessors.exists?(user_id: current_user.id)

      'none'
    end
  end
end
