# frozen_string_literal: true

module AI::IdpChat
  class AnalyzeDocument < AsyncResponseRequest::AsyncRequestHandler
    def call
      # call AI::IDPAssistantService.chat

      delay 10

      async_response.response_data = {
        role: 'assistant',

        content: { message: 'Process to generate summary', component: 'RequestConfirmation' }
      }

      broadcast(:ok, async_response)
    end

    private

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: context['async_request_uuid'],
        processing_status: :completed
      )
    end
  end
end
