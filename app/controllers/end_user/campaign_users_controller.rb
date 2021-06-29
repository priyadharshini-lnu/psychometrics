# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  before_action :set_campaign_user

  def begin_campaign
    data = CampaignUsers::BeginCampaign.call!(@campaign_user)

    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer, **data
  end

  def continue_campaign
    data = CampaignUsers::ContinueCampaign.call!(@campaign_user)

    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer, **data
  end

  private

  def set_campaign_user
    @campaign_user = CampaignUser.find(params[:id])
  end

  def campaign
    @campaign_user.campaign
  end
end
