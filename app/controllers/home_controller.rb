# frozen_string_literal: true

class HomeController < ApplicationController
  include SetCurrentCountry
  include SsoNavigation

  before_action :set_current_country, only: :request_inspect
  skip_before_action :authenticate_user!, only: %I[identify upgrade privacy_statement cookies_statement]
  skip_before_action :set_client_by_subdomain, only: %i[privacy_statement request_inspect cookies_statement]

  AVAILABLE_POLICY_LANGS = %w[en fr de it es-ES bg hr cs hu pl ro sr-Cyrl sk sl vi nl pt id zh zh-Hant ja ko th
                              ar hi ru sr-Latn zh-HK].freeze

  def survey_instructions
    render layout: 'users_new'
  end

  # TODO: needs some refactoring
  def sso
    if params[:user_assessment_id]
      user_assessment = UserAssessment.find_by(id: params[:user_assessment_id], evaluator_id: current_user.id)
      return handle_assessment_target_flow(user_assessment)
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
    Utility::Url.redirect_to_safe_internal_url(self, redirect_url)
  end

  # Browser upgrade notification
  def upgrade
    @browser_detections = helpers.detect_browser(request.user_agent)
    redirect_to root_path and return if @browser_detections.supported_browser?

    render layout: 'upgrade'
  end

  def privacy_statement
    locale = params[:lang]
    I18n.locale = AVAILABLE_POLICY_LANGS.include?(locale) ? locale.to_sym : I18n.default_locale
    render html: nil, layout: 'policy'
  end

  def cookies_statement
    cookie_notice_url = cookie_notice_url_for(params[:lang])
    response.set_header('Location', cookie_notice_url)
    head :found
  end

  def request_inspect
    raise ActionController::RoutingError, 'Not Found' unless current_user.is?(:superadmin)

    @headers = request.headers.to_h
    @ip = request.remote_ip
    @country = Current.user_country

    render 'request_inspect', layout: false
  end

  private

  def user_assessment
    @user_assessment ||= UserAssessment.find(params[:user_assessment_id])
  end
end
