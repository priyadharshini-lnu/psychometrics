# frozen_string_literal: true

module AI::IdpChat
  class AskChat < AsyncResponseRequest::AsyncRequestHandler
    include AsyncResponseRequest::AIRequestErrorHandler

    def call
      params = context[:params]
      options = { start_new_chat: params['restart_chat'] }.merge(retry_options)

      AI::AssistableService::Idp.call(plan, current_user, params['message'], **options) do
        on(:ok) do |response|
          async_response.response_data = response
        end
        on(:error) do |error_message, error|
          handle_error_with_retry(error_message, error)
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
