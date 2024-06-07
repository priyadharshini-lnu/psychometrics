# frozen_string_literal: true

class AsyncResponseRequest::GetAsyncResponse < BaseCommand
  attr_reader :async_request_uuid

  def initialize(async_request_uuid)
    @async_request_uuid = async_request_uuid
  end

  def call
    request_data = $redis.get(async_request_uuid) # rubocop:disable Style/GlobalVars

    if request_data.nil?
      broadcast :ok, [:request_not_found, nil]
    else
      async_response = AsyncResponseRequest::AsyncResponse.new(JSON.parse(request_data))

      broadcast :ok, [async_response.processing_status, async_response]
    end
  end
end
