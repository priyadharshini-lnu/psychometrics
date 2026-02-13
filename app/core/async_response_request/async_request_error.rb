# frozen_string_literal: true

class AsyncResponseRequest::AsyncRequestError < StandardError
  attr_accessor :async_response, :error

  def initialize(message = nil, async_response: nil, error: nil)
    super(message)
    @async_response = async_response
    @error = error
  end
end
