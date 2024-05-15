# frozen_string_literal: true

class AsyncResponseRequest::SetAsyncResponse < BaseCommand
  TTL = 2.minutes.freeze

  attr_reader :async_response

  def initialize(async_response:)
    @async_response = async_response
  end

  def call
    $redis.setex(async_response.async_request_uuid, TTL, async_response.to_json) # rubocop:disable Style/GlobalVars
  end
end
