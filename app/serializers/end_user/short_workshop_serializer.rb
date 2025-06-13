# frozen_string_literal: true

module EndUser
  class ShortWorkshopSerializer < Panko::Serializer
    attributes :id, :start_time, :meeting_link, :attended, :closed, :campaign_assessment_group_id

    def meeting_link
      object.real_meeting_link(current_user)
    end

    def attended
      workshop_subject&.attended?
    end

    def closed
      object.closed?
    end

    private

    def workshop_subject
      WorkshopSubject.find_by(workshop_id: object.id, user_id: current_user.id)
    end

    def current_user
      context[:current_user]
    end
  end
end
