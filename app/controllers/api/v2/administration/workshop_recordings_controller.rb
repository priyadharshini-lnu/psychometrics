# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopRecordingsController < Api::V2::Administration::BaseController
    append_before_action :set_workshop, only: %i[index]
    append_before_action :pundit_authorize

    def index
      jsonapi_render json: all_recordings
    end

    def pundit_authorize
      authorize(
        @workshop,
        nil,
        policy_class: Api::Administration::WorkshopRecordingPolicy,
        project_id:  @workshop.campaign.project_id,
        campaign_id: @workshop.campaign_id
      )
    end

    def set_workshop
      @workshop = Workshop.find(params[:workshop_id])
    end

    private

    def all_recordings
      workshop_recordings + assessment_recordings
    end

    def workshop_recordings
      @workshop.meeting_room&.meeting_recordings.to_a
    end

    def assessment_recordings
      user_assessments_scope = UserAssessment.with_campaign_assessments.with_workshop_activities.
                               where(campaign_id: @workshop.campaign).
                               where(subject_id: @workshop.workshop_subjects.select(:user_id))

      user_assessments_scope = user_assessments_scope.where(evaluator_id: current_user.id) if current_user.assessor?

      user_assessments_scope.
        includes(meeting_room: :meeting_recordings).
        flat_map { |ua| ua.linked_subject_user_assessment&.meeting_room&.meeting_recordings.to_a }.
        compact
    end
  end
end
