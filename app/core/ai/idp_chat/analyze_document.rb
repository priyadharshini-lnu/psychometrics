# frozen_string_literal: true

module AI::IdpChat
  class AnalyzeDocument < AsyncResponseRequest::AsyncRequestHandler
    def call
      # call AI::IDPAssistantService.chat
      #

      file_name = context[:meta][:file_name]

      AI::IdpAssistantService.call(plan, current_user, "Uploaded file #{file_name}") do
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
