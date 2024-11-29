# frozen_string_literal: true

module Simulation
  class GetDecisions < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      begin
        response = client.get("functions/v1/api/simulations/#{simulation_user_assessment.participant_id}/decisions")

        result = JSON.parse(response.body).first

        if response.status != 200
          raise Simulation::Exceptions::GetDecisionsFailed,
                "Simulation::GetDecisions failed for Assessment: #{user_assessment.id}. Error: #{response.body}"
        end
      rescue Faraday::Error => e
        Sentry.capture_exception(e)
        return broadcast :ok, {}
      end

      broadcast :ok, result
    end

    private

    def simulation_user_assessment
      user_assessment.simulation_user_assessment
    end
  end
end
