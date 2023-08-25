# frozen_string_literal: true

module MeetingRooms
  class Workshop
    private_attr_reader :workshop, :current_user

    def initialize(workshop, current_user)
      @workshop = workshop
      @current_user = current_user
    end

    def get_role
      if Api::Administration::WorkshopPolicy::Scope.new(current_user, ::Workshop).resolve.exists?(id: workshop.id)
        return 'owner'
      end

      return 'attendee' if workshop.workshop_subjects.find_by(user: current_user)

      'none'
    end
  end
end
