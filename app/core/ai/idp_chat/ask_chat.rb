# frozen_string_literal: true

module AI::IdpChat
  class AskChat < AsyncResponseRequest::AsyncRequestHandler
    def call
      # call AI::IDPAssistantService.chat
      params = context[:params]

      AI::IdpAssistantService.call(plan, current_user, params['message']) do
        on(:ok) do |response|
          async_response.response_data = response
        end
        on(:error) do |error_message|
          async_response.response_data = { content: { message: error_message, component: 'Error' } }
        end
      end

      broadcast(:ok, async_response)
    end

    private

    def current_user
      context[:current_user]
    end

    def plan
      current_user.active_user_idp_plan
    end

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: context[:async_request_uuid],
        processing_status: :completed
      )
    end
  end
end
