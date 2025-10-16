# frozen_string_literal: true

module EndUser
  class WorkshopSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers

    attributes :id, :start_time, :duration, :completion_status, :attendance_status, :attended,
               :preworks, :activities, :meeting_link
    delegate :attendance_status, :completion_status, :attended, to: :workshop_subject

    def preworks
      return unless user_assessments

      user_assessments.select { |r| r.prework == true }.map do |ua|
        ::EndUser::UserAssessmentSerializer.new(context: context).serialize(ua)
      end
    end

    def activities
      return unless user_assessments

      user_assessments.select { |r| r.prework == false }.map do |ua|
        ::EndUser::UserAssessmentSerializer.new(context: context).serialize(ua)
      end
    end

    def meeting_link
      object.real_meeting_link(current_user)
    end

    private

    def user_assessments
      context[:workshop_user_assessments]
    end

    def workshop_subject
      object.workshop_subjects.find_by(user_id: current_user.id)
    end

    def current_user
      context[:current_user]
    end
  end
end
