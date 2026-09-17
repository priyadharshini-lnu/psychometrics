# frozen_string_literal: true

module Assessments
  class RescoreLinkedResults < BaseCommand
    private_attr_reader :user_assessment, :campaign, :user

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @campaign = user_assessment.campaign
      @user = user_assessment.subject
    end

    def call
      return unless campaign_user
      return if campaign_user.campaign_scores_finalized?

      ::CampaignScoring::CalculateAndSave.call!(
        campaign,
        user,
        force_recalculate: true,
        campaign_factor_ids_to_recalculate: campaign_factor_ids_to_recalculate,
        update_campaign_user: false
      )
    end

    private

    def campaign_user
      @campaign_user ||= campaign.campaign_users.find_by(user_id: user.id)
    end

    def campaign_factor_ids_to_recalculate
      campaign.campaign_factors.
        where(assessment_id: user_assessment.assessment_id).
        or(campaign.campaign_factors.formula).
        pluck(:id)
    end
  end
end
