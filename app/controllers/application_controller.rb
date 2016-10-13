class ApplicationController < ActionController::Base
  # Authorisation flow
  #
  include Pundit
  ## Custom current user helper for Pundit
  def pundit_user
    current_administrator || current_user
  end

  layout :layout_by_resource
  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  prepend_before_action :set_client_by_subdomain
  prepend_before_action :authenticate

  # Authentication user/manager
  before_action :authenticate_user!

  # Redirect administrator after log out
  #
  def after_sign_out_path_for(resource_or_scope)
    resource_or_scope == :administrator ? new_administrator_session_path : new_user_session_path
  end

  # Redirect administrator after log in
  #
  def after_sign_in_path_for(resource)
    return administration_root_path if resource.is?(:superadmin, :admin)
    super
  end

  def layout_by_resource
    if devise_controller? && resource_name == :administrator
      'devise'
    else
      'application'
    end
  end

  private

  def set_client_by_subdomain
    subdomain = request.subdomain
    subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '')
    @current_client = Client.find_by(subdomain: subdomain) unless subdomain.blank?
  end

  def authenticate
    return if Rails.env.development?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
