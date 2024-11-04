# frozen_string_literal: true

module Simulation
  class ResetAssessment < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      simulation_user_assessment.update!(participant_id: nil)

      ::Simulation::RegisterParticipant.call!(user_assessment)

      broadcast :ok
    end

    def simulation_user_assessment
      @simulation_user_assessment ||= user_assessment.simulation_user_assessment
    end
  end
end
