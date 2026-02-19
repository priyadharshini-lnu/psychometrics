# frozen_string_literal: true

module AI::IdpChat
  class AnalyzeDocument < AsyncResponseRequest::AsyncRequestHandler
    include AsyncResponseRequest::AIRequestErrorHandler

    def call
      file_name = context[:meta][:file_name]
      options = retry_options

      AI::AssistableService::Idp.call(plan, current_user, "Uploaded file #{file_name}", **options) do
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
