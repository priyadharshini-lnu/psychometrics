# frozen_string_literal: true

class AsyncRequestHandlerJob < ApplicationJob
  queue_as :async_request_handler

  def perform(context:, handler:)
    async_request_uuid = context[:async_request_uuid]

    store_in_progress_response(async_request_uuid)
    async_response = handler.call!(context)
    store_completed_response(async_request_uuid, async_response)
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
end
