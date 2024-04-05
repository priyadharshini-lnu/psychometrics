# frozen_string_literal: true

module CampaignUsers
  class ResetCampaign < BaseCommand
    private_attr_reader :campaign, :user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
    end

    def call
      transaction do
        reset_internal_user_assessments
        reset_campaign_user
      end
      broadcast :ok
    end

    private

    def reset_campaign_user
      campaign_user = @campaign.campaign_users.find_by(user_id: user.id)

      campaign_user.update!(
        completed_at: nil,
        started_at: nil,
        expiry_date: nil,
        completion_status: 'not_started',
        status: 'not_started',
        campaign_scores_finalized: false,
        campaign_scores_calculated_date: nil,
        campaign_scores_finalized_date: nil,
        campaign_scores_errors: nil
      )
    end

    def reset_internal_user_assessments
      campaign.user_assessments.joins(:assessment).where(
        assessments: { type: Assessment::TYPES[:common] }
      ).each do |user_assessment|
        UsersResults::Reset.call(user_assessment)
      end
    end
  end
end
