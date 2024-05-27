# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  before_action :set_campaign_user
  before_action :check_all_prework_are_completed,
                only: %i[begin_campaign continue_campaign proctoring_redirect]

  def begin_campaign
    data = {}
    unless @campaign_user.not_started_campaign?
      return render json: { errors: I18n.t('campaign.errors.invalid_status') }, status: 422
    end

    if @campaign_user.proctoring_enabled?
      result = Examus::GetSessionUrl.call(@campaign_user, I18n.locale)
      if result[:error]
        return render json: { errors: result[:error] }, status: 422
      end

      data = { examus_session_url: result[:ok] }
    else
      CampaignUsers::BeginCampaign.call!(@campaign_user)
    end

    render json: ::EndUser::CampaignUserSerializer.new(context: {
      **data
    }).serialize(@campaign_user)
  end

  def proctoring_redirect
    return redirect_to_campaign unless @campaign_user.proctoring_enabled?

    if @campaign_user.not_started_campaign?
      CampaignUsers::BeginCampaign.call(@campaign_user)
    elsif @campaign_user.interrupted_campaign?
      CampaignUsers::ContinueCampaign.call(@campaign_user)
    end

    redirect_to_campaign
  end

  def continue_campaign
    unless @campaign_user.interrupted_campaign? || @campaign_user.in_progress_campaign?
      return render json: { errors: I18n.t('campaign.errors.invalid_status') }, status: 422
    end

    data = {}
    if @campaign_user.proctoring_enabled?
      result = Examus::GetSessionUrl.call(@campaign_user, I18n.locale)
      if result[:error]
        return render json: { errors: result[:error] }, status: 422
      end

      data = { examus_session_url: result[:ok] }
    else
      CampaignUsers::ContinueCampaign.call(@campaign_user)
    end

    render json: ::EndUser::CampaignUserSerializer.new(context: {
      **data
    }).serialize(@campaign_user)
  end

  private

  def check_all_prework_are_completed
    return if @campaign_user.all_prework_completed?

    render json: { errors: I18n.t('campaign.complete_tasks') }, status: 422
  end

  def redirect_to_campaign
    redirect_to(campaign_path(@campaign_user.campaign_id))
  end

  def set_campaign_user
    @campaign_user = current_user.campaign_users.find(params[:id])
  end

  def campaign
    @campaign_user.campaign
  end
end
