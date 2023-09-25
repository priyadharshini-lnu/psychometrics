# frozen_string_literal: true

module EndUser
  class ShortWorkshopSerializer < ActiveModel::Serializer
    attributes :id, :start_time, :meeting_link, :attended, :completed

    def meeting_link
      object.real_meeting_link
    end

    def attended
      workshop_subject&.attended?
    end

    def completed
      workshop_subject&.completed?
    end

    private

    def workshop_subject
      WorkshopSubject.find_by(workshop_id: object.id, user_id: current_user.id)
    end

    def current_user
      instance_options[:current_user]
    end
  end
end
