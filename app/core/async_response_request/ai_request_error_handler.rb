# frozen_string_literal: true

module AsyncResponseRequest
  module AIRequestErrorHandler
    extend ActiveSupport::Concern

    private

    def retry?
      context[:executions].to_i > 1
    end

    def retry_options
      # start_new_chat is set to false as retrying last request should not create new chat record
      retry? ? { retry_last_request: true, start_new_chat: false } : {}
    end

    def handle_error_with_retry(error_message, error)
      # For time being, retrying on all assistant errors,
      # TODO: This can be extended to specific error types like rate limit error
      if error.is_a?(RubyLLM::Error)
        async_response.response_data = { content: { message: error_message, component: 'Error' } }

        # Raise to trigger job retry with exponential backoff
        raise AsyncResponseRequest::AsyncRequestError.new(
          error_message,
          async_response: async_response,
          error: error
        )
      end

      async_response.response_data = { content: { message: error_message, component: 'Error' } }
    end
  end
end
