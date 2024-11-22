# frozen_string_literal: true

class AsyncRequestsController < ActionController::Base
  def status
    status, response = AsyncResponseRequest::GetAsyncResponse.call!(params[:async_request_uuid])

    render json: { status: status, response: response }
  end
end
