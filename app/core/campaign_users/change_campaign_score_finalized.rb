# frozen_string_literal: true

module CampaignUsers
  class ChangeCampaignScoreFinalized < BaseCommand
    private_attr_reader :campaign, :user_ids, :current_user, :campaign_score_finalized, :exclude

    def initialize(campaign:, user_ids:, current_user:, campaign_score_finalized:, exclude:)
      @campaign = campaign
      @user_ids = user_ids
      @current_user = current_user
      @campaign_score_finalized = campaign_score_finalized == true
      @exclude = exclude
    end

    def call
      campaign_users = ::CampaignUser.where(campaign_id: campaign.id)
      campaign_users = if exclude
                         user_ids.empty? ? campaign_users : campaign_users.where.not(user_id: user_ids)
                       else
                         user_ids.empty? ? campaign_users : campaign_users.where(user_id: user_ids)
                       end

      campaign_users.update_all(
        campaign_scores_finalized: campaign_score_finalized,
        campaign_scores_finalized_date: campaign_score_finalized ? Time.current : nil
      )
      if campaign_score_finalized
        UserReports::GenerateAndSavePdfJob.perform_later(
          campaign_factor_dependent_user_reports.pluck(:id), current_user
        )
      else
        UserReports::RemovePdfJob.perform_later(campaign_factor_dependent_user_reports.pluck(:id))
      end
    end

    private

    def campaign_factor_dependent_user_reports
      user_reports = UserReport.joins(:report).
                     merge(Report.campaign_factor_dependable).
                     where(campaign_id: campaign.id)

      if exclude
        user_ids.empty? ? user_reports : user_reports.where.not(user_id: user_ids)
      else
        user_ids.empty? ? user_reports : user_reports.where(user_id: user_ids)
      end
    end
  end
end
