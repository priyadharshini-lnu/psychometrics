# frozen_string_literal: true

module CampaignUsers
  class ChangeCampaignArtifactResultsFinalized < BaseCommand
    private_attr_reader :campaign, :user_ids, :current_user, :artifact_results_finalized

    def initialize(campaign:, user_ids:, current_user:, artifact_results_finalized:)
      @campaign = campaign
      @user_ids = user_ids
      @current_user = current_user
      @artifact_results_finalized = artifact_results_finalized == true
    end

    def call
      campaign_users = ::CampaignUser.where(campaign_id: campaign.id, user_id: user_ids)

      user_report_ids_to_act_on = campaign_users.flat_map { |cu| cu.campaign_ai_artifact_dependent_user_reports.ids }

      campaign_users.update_all(
        campaign_artifact_results_finalized: artifact_results_finalized,
        campaign_artifact_results_finalized_at: artifact_results_finalized ? Time.current : nil
      )

      if artifact_results_finalized
        UserReports::GenerateAndSavePdfJob.set(wait: 30.seconds).perform_later(user_report_ids_to_act_on, current_user)
      else
        UserReports::RemovePdfJob.perform_later(user_report_ids_to_act_on)
      end
    end
  end
end
