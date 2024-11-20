# frozen_string_literal: true

module CampaignFactors
  class CanCalculateAssessorScoringFactor < BaseCommand
    private_attr_reader :campaign_factor, :user

    def initialize(campaign_factor, user)
      @campaign_factor = campaign_factor
      @user = user
    end

    def call
      broadcast :ok, !non_completed_assessor_user_assessments_exists?
    end

    private

    def non_completed_assessor_user_assessments_exists?
      user_assessments_for_assessor_scoring.
        where.not(user_assessments: { status: :completed }).
        exists?
    end

    def user_assessments_for_assessor_scoring
      GetUserAssessmentForAssessorScoring.new(campaign_factor, user).query
    end
  end
end
