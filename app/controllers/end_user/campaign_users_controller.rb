# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  before_action :set_campaign_user

  def begin_campaign
    command = campaign.proctoring_enabled? ? 'BeginProctoredCampaign' : 'BeginRegularCampaign'
    "CampaignUsers::#{command}".constantize.call(@campaign_user) do
      on(:ok) do |out|
        options = { json: @campaign_user, serializer: ::EndUser::ProctoredCampaignUserSerializer }
        if campaign.proctoring_enabled?
          options[:jwt_token] = out[:token]
          options[:session_id] = out[:session_id]
        end

        render options
      end
      on(:error) do |error|
        render json: { error: error[:message] }, status: 400
      end
    end
  end

  def continue_campaign
    CampaignUsers::ContinueCampaign.call!(@campaign_user)

    render json: @campaign_user, serializer: ::EndUser::CampaignUserSerializer
  end

  private

  def set_campaign_user
    @campaign_user = CampaignUser.find(params[:id])
  end

  def campaign
    @campaign_user.campaign
  end
end
