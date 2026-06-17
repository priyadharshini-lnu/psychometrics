# frozen_string_literal: true

class EndUser::CampaignUsersController < ApplicationController
  include AsyncRequestHandler
  include SystemCheckCookie

  before_action :set_campaign_user
  before_action :ensure_proctoring_maintenance_not_active,
                only: %i[begin_campaign continue_campaign proctoring_redirect]
  before_action :check_all_prework_are_completed,
                only: %i[begin_campaign continue_campaign proctoring_redirect]

  before_action :ensure_campaign_not_in_progress, only: %i[begin_campaign]
  before_action :ensure_campaign_already_in_progress, only: %i[continue_campaign]

  async_request :begin_campaign_with_proctoring, handler: CampaignUsers::BeginProctoringCampaign,
    permit_params: ->(params) { params.require(:campaign_user).permit(:id, :system_check_session_id) }

  async_request :continue_campaign_with_proctoring, handler: CampaignUsers::ContinueProctoringCampaign,
    permit_params: ->(params) { params.require(:campaign_user).permit(:id, :system_check_session_id) }

  def proctoring_redirect
    return redirect_to_campaign unless @campaign_user.proctoring_enabled?

    session[:proctoring_mode] = true
    reissue_system_check_session_cookie_from_jwt

    if @campaign_user.not_started_campaign?
      CampaignUsers::BeginCampaign.call(@campaign_user)
    elsif @campaign_user.interrupted_campaign?
      CampaignUsers::ContinueCampaign.call(@campaign_user)
    end

    redirect_to_campaign
  end

  def begin_campaign
    if proctoring_flow_enabled?
      session[:proctoring_mode] = true
      params[:campaign_user] ||= {}
      params[:campaign_user][:system_check_session_id] = stored_session_id
      begin_campaign_with_proctoring
    else
      CampaignUsers::BeginCampaign.call!(@campaign_user)

      render json: { response_data: ::EndUser::CampaignUserSerializer.new(context: {}).serialize(@campaign_user) },
             status: :ok
    end
  end

  def continue_campaign
    if proctoring_flow_enabled?
      session[:proctoring_mode] = true
      params[:campaign_user] ||= {}
      params[:campaign_user][:system_check_session_id] = stored_session_id
      continue_campaign_with_proctoring
    else
      CampaignUsers::ContinueCampaign.call!(@campaign_user)
      render json: { response_data: ::EndUser::CampaignUserSerializer.new(context: {}).serialize(@campaign_user) },
             status: :ok
    end
  end

  private

  def ensure_campaign_not_in_progress
    return if @campaign_user.not_started_campaign?

    render json: { errors: I18n.t('campaign.errors.invalid_status') }, status: 422
  end

  def ensure_campaign_already_in_progress
    return if @campaign_user.interrupted_campaign? || @campaign_user.in_progress_campaign?

    render json: { errors: I18n.t('campaign.errors.invalid_status') }, status: 422
  end

  def check_all_prework_are_completed
    return if @campaign_user.all_prework_completed?

    render json: { errors: I18n.t('campaign.complete_tasks') }, status: 422
  end

  def ensure_proctoring_maintenance_not_active
    return unless @campaign_user.proctoring_enabled? && !params[:continue_without_proctoring]

    maintenance = MaintenanceSetting.find_by(sub_system: :proctoring)
    if maintenance&.active?
      render json: { errors: I18n.t('shared.maintenance_in_progress_title') }, status: :forbidden
    end
  end

  def redirect_to_campaign
    redirect_to(campaign_path(@campaign_user.campaign_id))
  end

  def reissue_system_check_session_cookie_from_jwt
    session_id = session.delete(:jwt_system_check_session_id)
    store_session_id(session_id) if session_id.present?
  end

  def set_campaign_user
    @campaign_user = current_user.campaign_users.find(params[:id])
  end

  def campaign
    @campaign_user.campaign
  end

  def proctoring_flow_enabled?
    @campaign_user.proctoring_enabled? &&
      !@campaign_user.campaign.selective_proctoring_enabled? &&
      !params[:continue_without_proctoring]
  end
end
