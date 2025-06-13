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

      workshop_ids = user_assessment.associated_workshops&.pluck(:id)

      return 'none' if workshop_ids.blank?

      return 'owner' if current_user.accessible_records(::Workshop, 'workshops.view').exists?(id: workshop_ids)

      return 'attendee' if WorkshopAssessor.exists?(workshop_id: workshop_ids, user_id: current_user.id)

      'none'
    end
  end
end
