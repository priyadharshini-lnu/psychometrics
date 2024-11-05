# frozen_string_literal: true

module Simulation
  class RegisterParticipant < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      response = client.put(
        '/functions/v1/api/participants',
        request_body.to_json
      )

      if response.status != 200
        raise Simulation::Exceptions::RegisterParticipantFailed,
              "Simulation::RegisterParticipant failed for Assessment: #{user_assessment.id}. Error: #{response.body}"
      end

      participant_id = ::JSON.parse(response.body)['id']

      user_assessment.simulation_user_assessment.update!(participant_id: participant_id)

      broadcast :ok
    end

    def request_body
      {
        organization: user_assessment.project.client.id.to_s
      }
    end
  end
end
