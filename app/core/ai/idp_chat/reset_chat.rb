# frozen_string_literal: true

module AI::IdpChat
  class ResetChat < AsyncResponseRequest::AsyncRequestHandler
    def call
      AI::IdpChat::CreateNewChatSession.call(plan, start_new_chat: true) do
        on(:ok) do |session|
          async_response.response_data = {
            content: EndUser::AIAssistedUserIdpSessionSerializer.new.serialize(session).to_h
          }
        end
        on(:error) do |error_message|
          async_response.response_data = { content: { message: error_message, component: 'Error' } }
        end
      end

      broadcast(:ok, async_response)
    rescue StandardError => e
      async_response.response_data = { content: { message: e.error, component: 'Error' } }
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
