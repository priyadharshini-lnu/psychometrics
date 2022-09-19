# frozen_string_literal: true

module Examus
  class GetSession < BaseCommand
    include Examus::Util

    private_attr_reader :session_id

    def initialize(session_id)
      @session_id = session_id
    end

    def call
      response = api_client.get("sessions/#{session_id}/status/")
      return broadcast :not_present unless (200...300).cover?(response.status)

      broadcast :ok, JSON.parse(response.body)
    end
  end
end
