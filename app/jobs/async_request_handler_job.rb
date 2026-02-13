# frozen_string_literal: true

class AsyncRequestHandlerJob < ApplicationJob
  queue_as :async_request_handler
  retry_on ::AsyncResponseRequest::AsyncRequestError, wait: lambda { |executions|
    executions * 15.seconds
  }, attempts: 3 do |job, exception|
    context = job.arguments.first[:context]
    handler = job.arguments.first[:handler]
    async_request_uuid = context[:async_request_uuid]

    # Send to Sentry after retries exhausted
    # TODO: May be keep the original error
    Sentry.capture_exception(exception,
                             extra: {
                               error: exception.error,
                               async_request_uuid: async_request_uuid,
                               handler: handler,
                               params: context,
                               retries_exhausted: true
                             })

    if exception.async_response
      AsyncResponseRequest::SetAsyncResponse.call!(async_response: exception.async_response)
    end
  end

  def perform(context:, handler:)
    async_request_uuid = context[:async_request_uuid]

    store_in_progress_response(async_request_uuid)

    # Add execution count to context so handler knows if it's a retry
    context_with_executions = context.merge(executions: executions)

    handler.call!(context_with_executions) do
      on(:ok) do |async_response|
        store_completed_response(async_request_uuid, async_response)
      end

      on(:invalid) do |async_response|
        store_failure_response(async_request_uuid, async_response)
      end
    end
  rescue AsyncResponseRequest::AsyncRequestError
    # Re-raise to let retry_on handle it with backoff
    raise
  rescue StandardError => e
    Sentry.capture_exception(e,
                             extra: {
                               async_request_uuid: async_request_uuid,
                               handler: handler,
                               params: context
                             })
  end

  private

  def store_in_progress_response(async_request_uuid)
    async_response = AsyncResponseRequest::AsyncResponse.new(
      async_request_uuid: async_request_uuid, processing_status: :in_progress
    )
    AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)
  end

  def store_completed_response(async_request_uuid, async_response)
    async_response.async_request_uuid = async_request_uuid
    async_response.processing_status = :completed
    AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)
  end

  def store_failure_response(async_request_uuid, async_response)
    async_response.async_request_uuid = async_request_uuid
    async_response.processing_status = :failed
    AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)
  end
end
