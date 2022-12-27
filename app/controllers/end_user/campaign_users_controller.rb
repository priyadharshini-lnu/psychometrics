# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  before_action :set_campaign_user

  def begin_campaign
    if @campaign_user.campaign.proctoring_license_with_enough_credits.present?
      data = CampaignUsers::BeginCampaign.call!(@campaign_user)
      render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer, **data
    else
      render json: { errors: I18n.t('licenses.not_enough_proctoring_credits') }, status: 422
    end
  end

  def continue_campaign
    return continue_campaign_successful_response unless @campaign_user.proctoring_enabled?

    Examus::FindOrCreateSession.call(@campaign_user) do
      on(:error) { |error| render json: { errors: error }, status: 422 }
      on(:ok) { continue_campaign_successful_response }
    end
  end

  private

  def continue_campaign_successful_response
    data = CampaignUsers::ContinueCampaign.call!(@campaign_user)
    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer, **data
  end

  def set_campaign_user
    @campaign_user = current_user.campaign_users.find(params[:id])
  end

  def campaign
    @campaign_user.campaign
  end
end
