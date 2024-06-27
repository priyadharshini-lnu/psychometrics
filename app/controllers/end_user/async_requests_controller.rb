# frozen_string_literal: true

class EndUser::AsyncRequestsController < ApplicationController
  skip_before_action :authenticate_user!

  def status
    status, response = AsyncResponseRequest::GetAsyncResponse.call!(params[:async_request_uuid])

    render json: { status: status, response: response }
  end
end
