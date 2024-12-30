# frozen_string_literal: true

module Simulation
  class DeleteParticipants < Base
    private_attr_reader :project_id

    def initialize(project_id)
      @project_id = project_id
    end

    def call
      response = client.delete('/functions/v1/api/participants') do |req|
        req.body = request_body.to_json
      end

      if response.status != 200
        raise Simulation::Exceptions::DeleteParticipantsFailed,
              "Simulation::DeleteParticipantsFailed failed for project id: #{project_id}. Error: #{response.body}"
      end

      broadcast :ok
    end

    def request_body
      {
        organization: project_id.to_s
      }
    end
  end
end
