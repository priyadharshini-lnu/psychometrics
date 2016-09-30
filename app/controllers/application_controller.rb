class ApplicationController < ActionController::Base
  layout :layout_by_resource
  protect_from_forgery with: :exception
  before_action :authenticate

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

  def authenticate
    return if Rails.env.development?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
