# frozen_string_literal: true

class ApplicationController < ::BaseController
  layout :layout_by_resource

  # Authentication user/manager
  before_action :set_client_by_subdomain
  append_before_action :set_membership, if: :user_signed_in?
  after_action :allow_iframe, if: proc { params['display'] == 'iframe' }

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Sets particular layout in depends of conditions
  #
  def layout_by_resource
    return 'devise'     if request.controller_class.to_s.start_with?('Administration')
    return 'ecommerce'  if request.controller_class.to_s.start_with?('Ecommerce')
    return 'devise'     if request.controller_class.to_s.start_with?('Devise')
    return 'iframe'     if params['display'] == 'iframe'

    'users_new'
  end

  def pundit_user
    {
      current_user: current_user,
      current_client: @current_client,
      current_project: @current_project,
      current_membership: @current_membership
    }
  end

  private

  def authenticate_user!
    Users::AuthenticateUser.call(params) do
      on(:ok) { |user| sign_in(user) }
      on(:invalid_sso_token) { |url| redirect_to(url) && return if url }
    end
    super
  end

  # Detect Client by subdomain
  def set_client_by_subdomain
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Ecommerce')
    return if request.controller_class.to_s.start_with?('Api::V1')
    subdomain = request.subdomain
    subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '') if Settings.subdomain
    @current_project = Client.enabled.find_by(subdomain: subdomain)
    return redirect_to("#{request.protocol}#{Settings.domain}:#{request.port}") unless @current_project

    @current_client = @current_project.client
  end

  # Fetch membership
  def set_membership
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Ecommerce')

    @current_membership = current_user.memberships.join_user.find_by(client_id: @current_project)
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

  # Allows to be in Iframe
  #
  def allow_iframe
    response.headers['X-Frame-Options'] = 'ALLOWALL'
  end

  # Sets default URL params to be in all links
  #
  def default_url_options
    options = super

    options.merge!(display: 'iframe') if params['display'] == 'iframe'
    options.merge!(return_url: params['return_url']) if params.has_key?('return_url')
    options.merge!(assign_id: params['assign_id']) if params.has_key?('assign_id')

    options
  end

  def user_not_authorized
    render plain: 'You does not have access to this page', status: 403
  end
end
