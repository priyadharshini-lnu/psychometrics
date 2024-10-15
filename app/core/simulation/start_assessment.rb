# frozen_string_literal: true

module Simulation
  class StartAssessment < AsyncResponseRequest::AsyncRequestHandler
    include Rails.application.routes.url_helpers

    def call
      if user_assessment.completed?
        async_response.response_data = assessment_completed_path(campaign.id, user_assessment_id: user_assessment.id)
        return broadcast :ok, async_response
      end

      if simulation_user_assessment&.participant_id.present?
        async_response.response_data = redirect_url
        return broadcast :ok, async_response
      end

      start_user_assessment

      if simulation_user_assessment.participant_id.present?
        async_response.response_data = redirect_url

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

        ::Simulation::RegisterParticipant.call!(user_assessment)
      end
    end

    def redirect_url
      ::Simulation::GetAssessmentUrl.call!(simulation_user_assessment)
    end

    def campaign
      user_assessment.campaign
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    end

    def simulation_user_assessment
      @simulation_user_assessment ||= user_assessment.simulation_user_assessment
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
