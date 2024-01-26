# frozen_string_literal: true

module Api
  class V2::Administration::CampaignUserScoringsController < Api::V2::Administration::BaseController
    before_action :find_user, only: %i[change_finalized_campaign_score rescore]

    def change_finalized_campaign_score
      campaign_user = ::CampaignUser.find_by(campaign_id: campaign.id, user_id: @user.id)
      audit! :change_finalized_campaign_score, campaign_user, payload: params[:data][:attributes], campaign: campaign

      campaign_user.update!(
        campaign_scores_finalized: params[:data][:attributes][:finalized],
        campaign_scores_finalized_date: params[:data][:attributes][:finalized] ? Time.current : nil
      )

      jsonapi_render json: campaign_user, options: { resource: ::Api::V2::Administration::CampaignUserResource }
    end

    def rescore
      audit! :campaign_scoring_rescore, @user, payload: {}, campaign: campaign
      ::CampaignScoring::Rescore.call!(campaign, @user)

      render json: {}
    end

    def change_finalized_campaign_score_bulk
      audit! :change_finalized_campaign_score_bulk, nil, record_type: CampaignUser,
        payload: params[:data][:attributes], campaign: campaign
      CampaignUsers::ChangeCampaignScoreFinalized.call!(
        campaign: campaign,
        user_ids: params[:data][:attributes][:user_ids],
        current_user: current_user,
        campaign_score_finalized: params[:data][:attributes][:finalized]
      )

      render json: :ok
    end

    def rescore_bulk
      audit! :campaign_scoring_rescore_bulk, nil, record_type: CampaignUser,
        payload: params[:data][:attributes], campaign: campaign

      AdminJob.call(
        :bulk_rescore_campaign_factors,
        { user_ids: params[:data][:attributes][:user_ids], campaign_id: campaign.id },
        current_user
      )

      render json: {}
    end

    def find_user
      @user = User.find(params[:id])
    end

    def policy_class
      @policy_class ||= Api::Administration::CampaignUserScoringPolicy
    end
  end
end
