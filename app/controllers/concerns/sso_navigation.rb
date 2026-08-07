# frozen_string_literal: true

module SsoNavigation
  extend ActiveSupport::Concern

  ALLOWED_JWT_POST_RETURN_STATUSES = %w[
    assessment_completed
    assessment_pending
    campaign_completed
    campaign_pending
  ].freeze

  private

  def handle_assessment_target_flow(user_assessment)
    return redirect_to_campaign_or_return_url('assessment_invalid') unless user_assessment
    return redirect_to_campaign_or_return_url('assessment_completed') if user_assessment.completed?
    return redirect_to_campaign_or_return_url('assessment_timed_out') if user_assessment.timed_out?
    return redirect_to_campaign_or_return_url('assessment_ineligible') if user_assessment.ineligible?

    unless UserAssessments::CanStartBasedOnSequencing.call!(user_assessment)
      return redirect_to_campaign_or_return_url('previous_assessment_incomplete')
    end

    campaign_user = user_assessment.campaign_user
    CampaignUsers::BeginCampaign.call(campaign_user) if campaign_user&.not_started?

    redirect_to(user_assessment_path(user_assessment))
  end

  def redirect_to_campaign_or_return_url(assessment_status = nil)
    campaign_id = params.fetch(:campaign_id, nil)

    redirect_path = if campaign_id.nil?
                      root_path
                    else
                      campaign_path(campaign_id)
                    end

    return redirect_to(redirect_path) if session[:sso].try(:[], 'return_url').nil?

    substitutions = {}

    if assessment_status.nil?
      result = check_assessment_status
      return redirect_to(redirect_path) if result[:redirect]

      assessment_status = result[:assessment_status]
    end

    assessment_status = normalize_return_status(
      status: assessment_status,
      source: session[:sso].try(:[], 'source')
    )

    substitutions.store('ASSESSMENT_STATUS', assessment_status) if assessment_status
    redirect_to return_url(substitutions, redirect_path)
  end

  def check_assessment_status
    campaign_id = params.fetch(:campaign_id, nil)
    sso_user_assessment_id = session[:sso].try(:[], 'user_assessment_id')
    if sso_user_assessment_id.nil?
      if campaign_id.present?
        cu = CampaignUser.find_by(campaign_id: campaign_id, user_id: current_user.id)
        return { redirect: true } unless cu.completed?
      end

      incomplete_campaign_count = CampaignUser.includes(:campaign).
                                  where(campaigns: { status: :active }).
                                  where(user_id: current_user.id).
                                  where.not(completion_status: :completed).
                                  count
      return { redirect: true } unless incomplete_campaign_count.zero?

      { assessment_status: 'campaign_completed' } if incomplete_campaign_count.zero?
    else
      user_assessment = UserAssessment.find_by(id: sso_user_assessment_id, evaluator_id: current_user.id)
      { assessment_status: "assessment_#{user_assessment.status}" }
    end
  end

  def return_url(substitutions, default_url)
    url = session[:sso]['return_url']
    substitutions.each { |k, v| url.gsub! k, v }
    uri = URI.parse(url)
    uri.to_s
  rescue URI::InvalidURIError
    default_url
  end

  def normalize_return_status(status:, source:)
    return status unless source == 'jwt_post'
    return status if status.blank?
    return status if ALLOWED_JWT_POST_RETURN_STATUSES.include?(status)

    status.start_with?('campaign_') ? 'campaign_pending' : 'assessment_pending'
  end
end
