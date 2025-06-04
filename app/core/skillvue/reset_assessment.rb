# frozen_string_literal: true

module Skillvue
  class ResetAssessment < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      skillvue_user_assessment.update!(url: nil, email: nil)

      ::Skillvue::InviteCandidate.call!(user_assessment)

      broadcast :ok
    end

    def skillvue_user_assessment
      @skillvue_user_assessment ||= user_assessment.skillvue_user_assessment
    end
  end
end
