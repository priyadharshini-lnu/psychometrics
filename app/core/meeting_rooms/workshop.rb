# frozen_string_literal: true

module MeetingRooms
  class Workshop
    private_attr_reader :workshop, :current_user

    def initialize(workshop, current_user)
      @workshop = workshop
      @current_user = current_user
    end

    def get_role
      return 'owner' if current_user.accessible_records(::Workshop, 'workshops.view').exists?(id: workshop.id)

      return 'attendee' if workshop.workshop_assessors.exists?(user_id: current_user.id)

      return 'attendee' if workshop.workshop_subjects.find_by(user: current_user)

      'none'
    end
  end
end
