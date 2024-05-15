# frozen_string_literal: true

module AsyncRequestHandler
  extend ActiveSupport::Concern

  included do
    helper_method :request_params, :async_request_uuid, :uuid
  end

  class_methods do
    def async_request(action_name, handler:, permit_params:)
      define_method(action_name) do
        context = default_async_request_context.merge(params: permit_params.call(params))

        AsyncRequestHandlerJob.perform_later(context: context, handler: handler)

        async_response = create_and_set_async_response

        render json: { async_request_uuid: async_response.async_request_uuid }, status: :ok
      end
    end
  end

  private

  def default_async_request_context
    {
      current_user: current_user,
      async_request_uuid: async_request_uuid
    }
  end

  def async_request_uuid
    @async_request_uuid ||= "#{uuid}|#{current_user.id}"
  end

  def uuid
    SecureRandom.urlsafe_base64(20)
  end

  def create_and_set_async_response
    async_response = AsyncResponseRequest::AsyncResponse.new(
      async_request_uuid: async_request_uuid, processing_status: :not_started
    )
    AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)

    async_response
  end
end
