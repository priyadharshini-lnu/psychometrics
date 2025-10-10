# frozen_string_literal: true

module Api
  class V2::Administration::Subjects::MeetingRecordingsController < Api::V2::Administration::BaseController
    append_before_action :set_user, only: %i[index]
    append_before_action :pundit_authorize

    def index
      user_recordings = ::MeetingRecordings::GetUserRecordings.call!(@user, campaign.id, current_user)

      jsonapi_render json: user_recordings
    end

    def pundit_authorize
      authorize(
        current_user,
        nil,
        policy_class: Api::Administration::SubjectMeetingRecordingPolicy,
        project_id:  campaign.project_id,
        campaign_id: campaign.id
      )
    end

    private

    def set_user
      @user = User.find(params[:subject_id])
    end
  end
end
