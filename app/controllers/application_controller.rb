# frozen_string_literal: true

class ApplicationController < ::BaseController
  include AuthenticateAnonymousUser
  layout :layout_by_resource

  # Authentication user/manager
  before_action :set_client_by_subdomain
  before_action :redirect_to_maintenance, if: -> { helpers.maintenance_started? }
  append_before_action :set_membership, if: :user_signed_in?
  after_action :allow_iframe_for_sso, if: proc { inside_sso_iframe? }
  after_action :allow_iframe_for_examus, if: proc { inside_examus_iframe? }
  around_action :set_mobility_locale
  before_action :set_locale
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  before_action :redirect_to_ae_domain, if: :redirect_to_ae_enabled?

  DOMAIN_REGEXP = %r{^(https?://.+\.)com}

  # Sets particular layout in depends of conditions
  #
  def layout_by_resource
    return 'devise'     if request.controller_class.to_s.start_with?('Administration')
    return 'ecommerce'  if request.controller_class.to_s.start_with?('Ecommerce')
    return 'devise'     if request.controller_class.to_s.start_with?('Devise')

    'users_new' # NOTE: seems it does not use anywhere
  end

  def pundit_user
    {
      current_user: current_user,
      current_client: @current_client,
      current_project: @current_project,
      current_membership: @current_membership
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

  def inside_examus_iframe?
    return true if session[:examus_origin]
    if params['examus-client-origin'].nil? || (!params['examus-client-origin'].end_with?('examus.net') &&
       !params['examus-client-origin'].end_with?('alemira.com'))
      return false
    end

    session[:examus_origin] = params['examus-client-origin']
  end

  def allow_iframe_for_examus
    response.headers['Content-Security-Policy'] = "frame-ancestors #{session[:examus_origin]}"
  end

  def inside_sso_iframe?
    session[:sso].try(:[], 'display') == 'iframe'
  end

  def allow_iframe_for_sso
    response.headers['X-Frame-Options'] = 'ALLOWALL'
  end

  def redirect_to_maintenance
    redirect_to maintenance_url
  end

  def redirect_to_ae_domain
    url = request.original_url
    redirect_to url.gsub(DOMAIN_REGEXP, '\1ae') if url.match(DOMAIN_REGEXP)
  end

  private

  def set_mobility_locale(&)
    Mobility.with_locale(ui_locale, &)
  end

  # Detect Client by subdomain

  # rubocop:disable Metrics/CyclomaticComplexity
  # rubocop:disable Metrics/PerceivedComplexity
  def set_client_by_subdomain
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Assessors')
    return if request.controller_class.to_s.start_with?('Ecommerce')
    return if request.controller_class.to_s.start_with?('Api::V1')
    return if request.controller_class.to_s.start_with?('Webhooks')

    @current_project = GetProjectBySubdomain.call!(request.subdomain)
    return render_http_locked if @current_project&.disabled?

    return if @current_project.nil? && request.controller_class.to_s == 'Devise::TwoFactorAuthenticationController'

    return redirect_to("#{request.protocol}#{Settings.domain}:#{request.port}") unless @current_project

    @current_client = @current_project.client
  end
  # rubocop:enable all

  # Fetch membership
  def set_membership # rubocop:disable Metrics/PerceivedComplexity
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Ecommerce')
    return if request.controller_class.to_s == 'Devise::TwoFactorAuthenticationController'

    @current_membership = current_user.memberships.join_user.find_by(client_id: @current_project)

    unless @current_membership
      campaign_user = current_user.campaign_users.includes(:project).find { |cu| cu.project == @current_project }
      return if campaign_user
    end

    current_user.current_membership = @current_membership
    if !@current_membership && current_user
      if current_user.is?(:superadmin)
        redirect_to("#{request.protocol}#{Settings.domain}:#{request.port}")
      else
        sign_out current_user
        redirect_to root_url
      end
    end
  end

  def user_not_authorized
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
