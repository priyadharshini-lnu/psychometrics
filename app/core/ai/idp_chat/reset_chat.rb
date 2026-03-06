# frozen_string_literal: true

module AI::IdpChat
  class ResetChat < AsyncResponseRequest::AsyncRequestHandler
    include AsyncResponseRequest::AIRequestErrorHandler

    def call
      options = { start_new_chat: true }.merge(retry_options)

      AI::IdpChat::CreateNewChatSession.call(plan, **options) do
        on(:ok) do |session|
          async_response.response_data = {
            content: EndUser::AIAssistedUserIdpSessionSerializer.new.serialize(session).to_h
          }
        end
        on(:error) do |error_message, error|
          error_response = { content: { message: error_message, component: 'Error' } }
          handle_error_with_retry(error_response, error)
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
