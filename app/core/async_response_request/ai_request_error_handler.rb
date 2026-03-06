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

    def handle_error_with_retry(error_response, error)
      # For time being, retrying on all assistant errors,
      # TODO: This can be extended to specific error types like rate limit error
      if error.is_a?(RubyLLM::Error)
        async_response.response_data = error_response

        raise AsyncResponseRequest::AsyncRequestError.new(
          error_response,
          async_response: async_response,
          error: error
        )
      end

      async_response.response_data = error_response
    end
  end
end
