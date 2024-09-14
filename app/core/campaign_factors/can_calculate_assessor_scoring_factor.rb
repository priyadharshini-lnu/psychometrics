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
      campaign.user_assessments.
        joins(:assessment).
        joins(assessment: :factors_scoring).
        where(user_assessments: { subject_id: user.id }).
        where(assessments: { category: Assessment::CATEGORIES[:assessor_form] }).
        where(factors_scoring: { factor_id: campaign_factor.factor_id }).
        where.not(user_assessments: { status: :completed }).
        exists?
    end

    def campaign
      @campaign ||= campaign_factor.campaign
    end
  end
end
