# frozen_string_literal: true

module CampaignUsers
  class CanAutoFinalizeCampaignScores < BaseCommand
    private_attr_reader :campaign, :campaign_user, :user

    def initialize(campaign, campaign_user, user)
      @campaign = campaign
      @campaign_user = campaign_user
      @user = user
    end

    def call
      broadcast :ok, can_auto_finalize?
    end

    private

    def can_auto_finalize?
      campaign_user.all_campaign_scores_present? && !non_completed_assessor_assessments_exist?
    end

    def non_completed_assessor_assessments_exist?
      campaign.user_assessments.
        joins(:assessment).
        where(user_assessments: { subject_id: user.id }).
        where(assessments: { category: [Assessment::CATEGORIES[:assessor_form]] }).
        where.not(user_assessments: { status: :completed }).
        exists?
    end
  end
end
