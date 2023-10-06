# frozen_string_literal: true

module MeetingRooms
  class UserAssessment
    private_attr_reader :user_assessment, :current_user

    def initialize(user_assessment, current_user)
      @user_assessment = user_assessment
      @current_user = current_user
    end

    def get_role
      if current_user.id == user_assessment.subject_id
        return 'attendee'
      end

      workshop = current_user.last_workshop(user_assessment.campaign_id)

      if workshop &&
         Api::Administration::WorkshopPolicy::Scope.new(current_user, ::Workshop).resolve.exists?(id: workshop.id)
        return 'owner'
      end

      'none'
    end
  end
end
