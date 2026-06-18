# frozen_string_literal: true

module CampaignUsers
  class ContinueProctoringCampaign < AsyncResponseRequest::AsyncRequestHandler
    def call
      return broadcast :invalid, async_response unless campaign_user.proctoring_enabled?

      result = Examus::GetSessionUrl.call(
        campaign_user: campaign_user,
        locale: I18n.locale,
        system_check_session_id: params[:system_check_session_id]
      )
      if result[:error]
        async_response.response_data = { error: result[:error] }
        async_response.processing_status = :failed

        return broadcast :invalid, async_response
      end

      async_response.response_data = serialized_data({ examus_session_url: result[:ok] })

      broadcast :ok, async_response
    end

    private

    def campaign_user
      @campaign_user ||= current_user.campaign_users.find(params[:id])
    end

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        processing_status: :completed
      )
    end

    def serialized_data(data)
      ::EndUser::CampaignUserSerializer.new(context: {
        **data
      }).serialize(campaign_user)
    end
  end
end
