# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  before_action :set_campaign_user

  def begin_campaign
    if Licenses::IsEnoughLicenseCredits.call!(@campaign_user)
      data = CampaignUsers::BeginCampaign.call!(@campaign_user)
      render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer, **data
    else
      render json: { errors: I18n.t('licenses.not_enough_proctoring_credits') }, status: 422
    end
  end

  def continue_campaign
    if @campaign_user.proctoring_enabled?
      _, type = Examus::FindOrCreateSession.call!(@campaign_user)
      if type == :new && !Licenses::IsEnoughLicenseCredits.call!(@campaign_user)
        render json: { errors: I18n.t('licenses.not_enough_proctoring_credits') }, status: 422 && return
      end
    end
    data = CampaignUsers::ContinueCampaign.call!(@campaign_user)
    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer, **data
  end

  private

  def set_campaign_user
    @campaign_user = current_user.campaign_users.find(params[:id])
  end

  def campaign
    @campaign_user.campaign
  end
end
