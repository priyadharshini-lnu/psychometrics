# frozen_string_literal: true

class ApplicationController < ::BaseController
  include AuthenticateAnonymousUser
  include ActiveStorage::SetCurrent
  layout :layout_by_resource

  # Authentication user/manager
  before_action :set_client_by_subdomain
  before_action :redirect_to_maintenance, if: -> { helpers.maintenance_started? }
  after_action :set_content_security_policy
  around_action :set_mobility_locale
  before_action :set_locale
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  before_action :redirect_to_ae_domain, if: :redirect_to_ae_enabled?
  before_action :ensure_user_profile_completed
  DOMAIN_REGEXP = %r{^(https?://.+\.)com}

  # Sets particular layout in depends of conditions
  #
  def layout_by_resource
    return 'devise'     if request.controller_class.to_s.start_with?('Administration')
    return 'devise'     if request.controller_class.to_s.start_with?('Devise')

    'users_new' # NOTE: seems it does not use anywhere
  end

  def pundit_user
    {
      current_user: current_user,
      current_client: @current_client,
      current_project: @current_project
    }
  end

  protected

  def add_cookie(name, value)
    secure = Settings.protocol == 'https'
    cookies[name] = {
      value: value,
      httponly: true,
      secure: secure,
      same_site: secure ? 'None' : 'Lax'
    }
  end

  def set_content_security_policy
    allowed_domains = inside_sso_iframe? ? '*.maialearning.com' : '*.proctor.alemira.com'
    response.headers['Content-Security-Policy'] = "frame-ancestors #{allowed_domains}"
  end

  def inside_sso_iframe?
    session[:sso].try(:[], 'display') == 'iframe'
  end

  def redirect_to_maintenance
    redirect_to maintenance_url
  end

  def redirect_to_ae_domain
    url = request.original_url
    redirect_to url.gsub(DOMAIN_REGEXP, '\1ae') if url.match(DOMAIN_REGEXP)
  end

  private

  def ensure_user_profile_completed
    return if request.method != 'GET' || request.path == '/profile_details'
    return if request.controller_class.to_s.start_with?('Devise::TwoFactorAuthenticationController')

    return unless @current_project && current_user

    update_in = @current_project.profile_setting.update_in || 9999

    completion = Users::ProfileCompletion.call!(current_user)

    if completion < 100 || (Time.current - current_user.user_profile.updated_at) > update_in.month
      session[:back_url] = request.original_url
      redirect_to '/profile_details'
    end
  end

  def set_mobility_locale(&)
    Mobility.with_locale(ui_locale, &)
  end

  # Detect Client by subdomain

  # rubocop:disable Metrics/CyclomaticComplexity
  # rubocop:disable Metrics/PerceivedComplexity
  # rubocop:disable Metrics/AbcSize
  def set_client_by_subdomain
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Assessors')
    return if request.controller_class.to_s.start_with?('Api::V1')
    return if request.controller_class.to_s.start_with?('Webhooks')

    @current_project = GetProjectBySubdomain.call!(request.subdomain)
    return render_http_locked if @current_project&.disabled?

    return if @current_project.nil? && request.controller_class.to_s == 'Devise::TwoFactorAuthenticationController'
    return if @current_project.nil? && request.controller_class.to_s == 'Users::UnlocksController'
    unless @current_project
      return redirect_to("#{request.protocol}#{Settings.domain}:#{request.port}", allow_other_host: true)
    end

    if current_user && current_user.project_id != @current_project.id
      sign_out(current_user)
      return redirect_to("#{request.protocol}#{Settings.domain}:#{request.port}", allow_other_host: true)
    end

    @current_client = @current_project.client
  end
  # rubocop:enable all

  def user_not_authorized
    audit! :user_not_authorized, current_user, payload: params, outcome: :failed,
    failure_reason: :user_not_authorized
    respond_to do |format|
      format.html { render plain: I18n.t('errors.forbidden'), status: 403 }
      format.json { render json: { error: [I18n.t('errors.forbidden_action')] }, status: 403 }
    end
  end

  def set_locale
    I18n.locale = ui_locale
  end

  def render_http_locked
    render file: Rails.public_path.join('423.html'), layout: false, status: :locked
  end

  def redirect_to_ae_enabled?
    return false unless Rails.env.production?
    return false unless ENV['UAE_DATA_MIGRATION_REDIRECT_ENABLED'] == 'true'

    domains = ENV.fetch('UAE_DATA_MIGRATION_SUBDOMAINS', '')&.split(',')
    domains.include?(@current_project&.subdomain)
  end
end
