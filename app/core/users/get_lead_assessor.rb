# frozen_string_literal: true

module Users
  class GetLeadAssessor < BaseCommand
    attr_reader :campaign, :user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
    end

    def call
      lead_user_assessment = UserAssessments::GetLeadUserAssessmentForSubject.call!(campaign, user)
      broadcast :ok, lead_user_assessment&.evaluator
    end
  end
end
