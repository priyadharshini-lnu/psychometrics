# frozen_string_literal: true

class HomeController < ApplicationController
  skip_before_action :authenticate_user!, only: %I[identify upgrade privacy_statement]
  skip_before_action :set_client_by_subdomain, only: %i[privacy_statement]

  def survey_instructions
    render layout: 'users_new'
  end

  # TODO: needs some refactoring
  def sso # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    if params[:user_assessment_id]
      user_assessment = UserAssessment.find_by(id: params[:user_assessment_id], evaluator_id: @current_user.id)
      redirect_to_campaign_or_return_url('assessment_invalid') && return unless user_assessment
      redirect_to_campaign_or_return_url('assessment_completed') && return if user_assessment.completed?
      redirect_to_campaign_or_return_url('assessment_timed_out') && return if user_assessment.timed_out?
      redirect_to_campaign_or_return_url('assessment_ineligible') && return if user_assessment.ineligible?
      unless UserAssessments::CanStartBasedOnSequencing.call!(user_assessment)
        return redirect_to_campaign_or_return_url('previous_assessment_incomplete')
      end

      campaign_user = user_assessment.campaign_user
      CampaignUsers::BeginCampaign.call(campaign_user) if campaign_user.not_started?
      redirect_to(user_assessment_path(user_assessment)) && return
    end

    redirect_to_campaign_or_return_url
  end

  def assessment_completed
    redirect_to_campaign_or_return_url
  end

  # To be used by the integrators when using SSO url in an iframe
  # as a workaround to Safari's cookie restrictions in iframe
  def identify
    cookies[:ident_session] = {
      value: 1,
      httponly: true,
      secure: true,
      same_site: 'None',
      expires: 6.hours
    }
    redirect_url = params.fetch(:redirect_url) { root_path }
    redirect_to(redirect_url)
  end

  # Browser upgrade notification
  def upgrade
    @browser_detections = helpers.detect_browser(request.user_agent)
    redirect_to root_path and return if @browser_detections.supported_browser?

    render layout: 'upgrade'
  end

  def privacy_statement
    I18n.locale = %w[en fr].include?(params[:lang]) ? params[:lang] : I18n.default_locale
    render html: nil, layout: 'policy'
  end

  private

  def redirect_to_campaign_or_return_url(assessment_status = nil)
    campaign_id = params.fetch(:campaign_id, nil)

    redirect_path = if campaign_id.nil?
                      root_path
                    else
                      campaign_path(campaign_id)
                    end

    return redirect_to(redirect_path) if session[:sso].try(:[], 'return_url').nil?

    substitutions = {}

    # Do not redirect back to return_url until all assessments are completed if sso url
    # was not a direct assessment link
    if assessment_status.nil?
      result = check_assessment_status
      return redirect_to redirect_path if result[:redirect]

      assessment_status = result[:assessment_status]
    end

    substitutions.store('ASSESSMENT_STATUS', assessment_status) if assessment_status
    redirect_to return_url(substitutions, redirect_path)
  end

  def check_assessment_status
    campaign_id = params.fetch(:campaign_id, nil)
    sso_user_assessment_id = session[:sso].try(:[], 'user_assessment_id')
    if sso_user_assessment_id.nil?
      if campaign_id.present?
        cu = CampaignUser.find_by(campaign_id: campaign_id, user_id: @current_user.id)
        return { redirect: true } unless cu.completed?
      end

      incomplete_campaign_count = CampaignUser.includes(:campaign).
                                  where(campaigns: { status: :active }).
                                  where(user_id: @current_user.id).
                                  where.not(completion_status: :completed).count
      return { redirect: true } unless incomplete_campaign_count.zero?

      { assessment_status: 'assessment_completed' } if incomplete_campaign_count.zero?
    else
      user_assessment = UserAssessment.find_by(id: sso_user_assessment_id, evaluator_id: @current_user.id)
      { assessment_status: "assessment_#{user_assessment.status}" }
    end
  end

  def return_url(substitutions, default_url)
    url = session[:sso]['return_url']
    substitutions.each { |k, v| url.gsub! k, v }
    uri = URI.parse url
    uri.to_s
  rescue URI::InvalidURIError
    default_url
  end

  def user_assessment
    @user_assessment ||= UserAssessment.find(params[:user_assessment_id])
  end
end
