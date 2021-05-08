# frozen_string_literal: true

class HomeController < ApplicationController
  skip_before_action :authenticate_user!, only: %I[identify upgrade]

  def survey_instructions
    render layout: 'users_new'
  end

  # TODO: needs some refactoring
  def sso
    if params[:user_assessment_id]
      user_assessment = UserAssessment.find_by(id: params[:user_assessment_id], evaluator_id: @current_user.id)
      redirect_to_campaign_or_return_url('assessment_invalid') && return unless user_assessment
      redirect_to_campaign_or_return_url('assessment_completed') && return if user_assessment.completed?

      campaign_user = user_assessment.campaign_user
      CampaignUsers::BeginRegularCampaign.call(campaign_user) if campaign_user.not_started?
      redirect_url = pass_user_assessment_path(params[:user_assessment_id])
      redirect_to(redirect_url) && return
    end

    redirect_to_campaign_or_return_url
  end

  def assessment_completed
    redirect_to_campaign_or_return_url
  end

  # To be used by the integrators when using SSO url in an iframe
  # as a workaround to Safari's cookie restrictions in iframe
  def identify
    cookies.permanent[:ident_session] = 1
    redirect_url = params.fetch(:redirect_url) { root_path }
    redirect_to(redirect_url)
  end

  # Browser upgrade notification
  # rubocop:disable Style/AndOr
  def upgrade
    @browser_detections = helpers.detect_browser(request.user_agent)
    redirect_to root_path and return if @browser_detections.supported_browser?

    render layout: 'devise'
  end
  # rubocop:enable Style/AndOr

  private

  def redirect_to_campaign_or_return_url(assessment_status = nil)
    campaign_id = params.fetch(:campaign_id) { nil }
    redirect_path = campaign_id.nil? ? root_path : campaign_path(campaign_id)
    return redirect_to(redirect_path) if session[:sso].try(:[], 'return_url').nil?

    substitutions = {}

    # Do not redirect back to return_url until all assessments are completed if sso url
    # was not a direct assessment link
    if assessment_status.nil? && session[:sso].try(:[], 'user_assessment_id').nil?
      if campaign_id.present?
        cu = CampaignUser.find_by(campaign_id: campaign_id, user_id: @current_user.id)
        return redirect_to(redirect_path) unless cu.completed?
      end

      incomplete_campaign_count = CampaignUser.includes(:campaign).
                                  where(campaigns: { status: :active }).
                                  where(user_id: @current_user.id).
                                  where.not(completion_status: :completed).count
      return redirect_to redirect_path unless incomplete_campaign_count.zero?
    end

    substitutions.store('ASSESSMENT_STATUS', assessment_status) if assessment_status
    redirect_to return_url(substitutions, redirect_path)
  end

  def return_url(substitutions, default_url)
    url = session[:sso]['return_url']
    substitutions.each { |k, v| url.gsub! k, v }
    uri = URI.parse url
    uri.to_s
  rescue URI::InvalidURIError
    default_url
  end
end
