# frozen_string_literal: true

class BaseController < ActionController::Base
  include Pundit
  include SetLocale
  include AddCookie
  include ControllerUtilities
  include CookieNotice
  prepend AuditLogModule::ControllerHelper
  include SiemLogger::ControllerHelper

  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  prepend_before_action :redirect_to_maintenance, if: -> { helpers.maintenance_started? }
  prepend_before_action :authenticate_user!, unless: -> { try(:skip_authentication?) }
  prepend_before_action :set_client_by_subdomain
  prepend_before_action :set_request_related_current_attributes
  prepend_before_action :set_current_user_in_current_attributes

  around_action :with_user_id_log_context
  before_action :detect_mobile
  before_action :set_sentry_context
  before_action :enforce_password_change

  rescue_from Rack::Timeout::RequestTimeoutException, with: :timeout
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_invalid_authenticity_token

  def redirect_to_maintenance
    redirect_to maintenance_url
  end

  def change_password_required_path_for(_)
    if current_user.is?(:regular)
      super
    else
      administration_password_expired_path
    end
  end

  def enforce_password_change
    return unless user_signed_in?
    return if devise_controller? || session[:spoofed] || @anonymous_user
    return unless warden.session(:user)['enforce_password_change']

    store_location_for(:user, request.original_fullpath) if request.get? && request.format.html?
    flash.delete(:notice)
    I18n.locale = user_locale
    redirect_to change_password_required_path_for(:user),
                alert: I18n.t('devise.password_expired.password_policy_changed')
  end

  # Detect Client by subdomain

  # rubocop:disable Metrics/CyclomaticComplexity
  # rubocop:disable Metrics/PerceivedComplexity
  def set_client_by_subdomain
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Assessors')
    return if request.controller_class.to_s.start_with?('Api::V1')
    return if request.controller_class.to_s.start_with?('Webhooks')
    return if request.controller_class.to_s.start_with?('Users::SessionExtensionsController')

    @current_project = GetProjectBySubdomain.call!(request.subdomain)
    return render_http_locked if @current_project&.disabled?

    return if @current_project.nil? && request.controller_class.to_s == 'Devise::TwoFactorAuthenticationController'
    return if @current_project.nil? && request.controller_class.to_s == 'Users::UnlocksController'
    return if @current_project.nil? && request.controller_class.to_s == 'Users::SamlSessionsController'

    unless @current_project
      return redirect_to root_url(subdomain: Settings.subdomain)
    end

    Current.project = @current_project
    @current_client = @current_project.client
  end
  # rubocop:enable all

  def authenticate_user!
    return if @anonymous_user

    Users::AuthenticateUser.call(params, @current_project) do
      on(:ok) { |user, found_by, auth_details| handle_successful_authentication(user, found_by, auth_details) }
      on(:invalid_sso_token) do |url|
        siem_log_authentication_failure('sso')
        redirect_to(url) && return if url
      end
      on(:invalid_jwt_token) do |url|
        siem_log_authentication_failure('jwt')
        redirect_to(url) && return if url
      end
    end
    super
  end

  def handle_successful_authentication(user, found_by, auth_details)
    handle_spoofing(found_by, user)
    handle_sso_or_jwt(found_by, user)

    siem_log_authentication_success(user, found_by) if siem_loggable_auth_method?(found_by)

    sign_in_and_redirect(user, found_by, auth_details)
  end

  def handle_spoofing(found_by, user)
    if found_by == :spoof
      request.env['warden'].request.env['devise.skip_trackable'] = 1
      session[:spoofed] = true
      session[:impersonated_by_id] = user.spoofed_by_id
      user.update_column(:spoofed_by_id, nil)
    else
      session.delete(:spoofed)
      session.delete(:impersonated_by_id)
    end
  end

  def handle_sso_or_jwt(found_by, user)
    if %i[sso api_jwt lighthouse_jwt].include?(found_by)
      session[:sso] = {
        'user_id' => user.id,
        'user_assessment_id' => params[:user_assessment_id],
        'display' => params[:display],
        'return_url' => params[:return_url]
      }
    else
      session.delete(:sso)
    end
  end

  def sign_in_and_redirect(user, found_by, auth_details)
    skip_session_limitable = found_by == :spoof || auth_details['skip_session_limitable'] == true
    sign_in(user, skip_session_limitable: skip_session_limitable)
    flash.discard(:alert)

    return Utility::Url.redirect_to_safe_internal_url(self, url_without_spoof) if found_by == :spoof

    Utility::Url.redirect_to_safe_internal_url(self, url_without_jwt) if %i[api_jwt lighthouse_jwt].include?(found_by)
  end

  def send_tmp_file(file_path, options = {})
    unless Utility::FileSecurity.safe_send_file(self, file_path, Rails.root.join('tmp').to_s, **options)
      head :not_found
    end
  end

  private

  def siem_loggable_auth_method?(found_by)
    %i[api_jwt lighthouse_jwt sso].include?(found_by)
  end

  def ignore_password_expire?
    session[:spoofed] || session[:login_via_magic_link] || session[:saml_login]
  end

  def redirect_for_password_change(scope)
    message = I18n.t(
      current_user.force_password_change? ? 'forced_changed' : 'change_required',
      scope: 'devise.password_expired'
    )
    redirect_to change_password_required_path_for(scope), alert: message
  end

  def url_without_spoof
    Utility::Url.remove_query_params(request.url,
                                     [Users::AuthenticateUser::SPOOF_KEY.to_s,
                                      Users::AuthenticateUser::REDIRECT_KEY.to_s])
  end

  def url_without_jwt
    Utility::Url.remove_query_params(request.url,
                                     [Users::AuthenticateUser::JWT_KEY.to_s,
                                      Users::AuthenticateUser::REDIRECT_KEY.to_s])
  end

  def feature_flags
    # Some values can be null
    Settings.features.to_h.transform_values { |v| v == true }
  end

  def set_request_related_current_attributes
    Current.request_id = request.request_id
    Current.ip_address = request.remote_ip
    Current.request_url = request.url
    Current.application_component = end_user_side? ? 'end_user' : 'admin'
  end

  def set_current_user_in_current_attributes
    Current.user = current_user
  end

  def detect_mobile
    request.variant = :mobile if browser.device.mobile?
  end

  def timeout
    remove_cookie_for_file_download
    render 'errors/timeout.html.slim', status: :request_timeout
  end

  def remove_cookie_for_file_download
    cookies.delete(:fileDownload)
  end

  def set_sentry_context
    Sentry.set_user(id: current_user&.id) # or anything else in session
    Sentry.set_extras(params: params.to_unsafe_h, url: request.url)
  end

  def handle_invalid_authenticity_token(exception = nil)
    siem_log_session_management_exception(exception)

    respond_to do |f|
      f.html do
        flash[:notice] = t('errors.try_again')
        redirect_back(fallback_location: root_path)
      end
      f.js { render(:error, locals: { message: t('errors.invalid_token') }) }
    end
  end

  def with_user_id_log_context(&)
    if user_signed_in?
      SemanticLogger.named_tagged(user_id: current_user.id, &)
    else
      yield
    end
  end
end
