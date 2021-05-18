# frozen_string_literal: true

module Examus
  class IsSessionAlive < BaseCommand
    include Examus::Util

    private_attr_reader :session_id

    def initialize(session_id)
      @session_id = session_id
    end

    def call
      res = api_client.get("sessions/#{session_id}/status/")
      data = JSON.parse(res.body)

      broadcast :ok, data['status'] == 'started'
    end
  end
end
