# frozen_string_literal: true

module Examus
  class FinishSession < BaseCommand
    include Examus::Util

    private_attr_reader :session_id

    def initialize(session_id)
      @session_id = session_id
    end

    def call
      api_client.post("sessions/#{session_id}/finish/")

      broadcast :ok
    end
  end
end
