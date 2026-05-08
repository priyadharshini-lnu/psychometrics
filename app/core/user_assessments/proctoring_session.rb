# frozen_string_literal: true

module UserAssessments
  class ProctoringSession < AsyncResponseRequest::AsyncRequestHandler
    def call
      return broadcast :invalid, async_response unless user_assessment.proctoring_enabled?

      result = Examus::GetSessionUrl.call(campaign_user: user_assessment.campaign_user, locale: I18n.locale,
                                          subject: user_assessment)

      if result[:error]
        async_response.response_data = { error: result[:error] }
        async_response.processing_status = :failed

        return broadcast :invalid, async_response
      end

      async_response.response_data = serialized_data({ examus_session_url: result[:ok] })

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
