# frozen_string_literal: true

module Mhs
  class StartAssessment < AsyncResponseRequest::AsyncRequestHandler
    include Rails.application.routes.url_helpers

    def call
      if user_assessment.completed?
        async_response.response_data = assessment_completed_path(campaign.id,
                                                                 user_assessment_id: user_assessment.id)
        return broadcast :ok, async_response
      end

      if mhs_user_assessment&.url.present?
        async_response.response_data = mhs_user_assessment.url
        return broadcast :ok, async_response
      end

      start_user_assessment

      if mhs_user_assessment.url.present?
        async_response.response_data = mhs_user_assessment.url

        broadcast :ok, async_response
      else
        broadcast(:invalid, async_response)
      end
    end

    private

    def start_user_assessment
      transaction do
        user_assessment.update!(started_at: Time.zone.now) if user_assessment.started_at.nil?
        user_assessment.in_progress!

        create_mhs_session
      end
    end

    def create_mhs_session
      return if mhs_user_assessment.session_id.present?

      Mhs::CreateSession.call(user_assessment)
      Mhs::CreateDataGatherer.call(mhs_user_assessment.session_id, user_assessment)
    end

    def campaign
      user_assessment.campaign
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    end

    def mhs_user_assessment
      @mhs_user_assessment ||= user_assessment.mhs_user_assessment
    end

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        processing_status: :completed,
        response_type: :redirect,
        response_data: nil
      )
    end
  end
end
