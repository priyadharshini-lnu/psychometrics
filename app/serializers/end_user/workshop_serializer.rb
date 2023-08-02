# frozen_string_literal: true

module EndUser
  class WorkshopSerializer < ActiveModel::Serializer
    attributes :start_time, :duration, :completion_status, :attendance_status, :attended
    delegate :attendance_status, :completion_status, :attended, to: :workshop_subject

    private

    def workshop_subject
      object.workshop_subjects.find_by(user_id: current_user.id)
    end
  end
end
