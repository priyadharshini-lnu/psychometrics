# frozen_string_literal: true

module UserAssessments
  class FinishProctoringSession < AsyncResponseRequest::AsyncRequestHandler
    def call
      return broadcast(:invalid, async_response) unless user_assessment.proctoring_enabled?

      user_assessment.finish_proctoring_session

      async_response.response_data = serialized_data({})
      broadcast :ok, async_response
    end

    private

    def user_assessment
      @user_assessment ||= UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    end

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        processing_status: :completed
      )
    end

    def serialized_data(data)
      ::EndUser::CampaignUserSerializer.new(context: {
        **data
      }).serialize(user_assessment.campaign_user)
    end
  end
end
