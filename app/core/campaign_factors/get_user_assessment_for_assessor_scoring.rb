# frozen_string_literal: true

module CampaignFactors
  class GetUserAssessmentForAssessorScoring < Rectify::Query
    attr_reader :campaign_factor, :user

    def initialize(campaign_factor, user)
      @campaign_factor = campaign_factor
      @user = user
    end

    def query
      campaign.user_assessments.
        joins(:assessment).
        joins(assessment: :factors_scoring).
        where(user_assessments: { subject_id: user.id }).
        where(assessments: { category: Assessment::CATEGORIES[:assessor_form] }).
        where(factors_scoring: {
          factor_id: [
            campaign_factor.factor_id,
            campaign_factor.factor.sub_factors.ids
          ].flatten
        })
    end

    private

    def campaign
      @campaign ||= campaign_factor.campaign
    end
  end
end
