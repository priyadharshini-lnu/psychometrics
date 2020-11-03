# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  before_action :set_campaign_user

  def begin_campaign
    CampaignUsers::BeginCampaign.call!(@campaign_user)

    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer
  end

  def continue_campaign
    CampaignUsers::ContinueCampaign.call!(@campaign_user)

    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer
  end

  private

  def set_campaign_user
    @campaign_user = CampaignUser.find(params[:id])
  end
end
