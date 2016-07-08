class ApplicationController < ActionController::Base
  layout :layout_by_resource
  protect_from_forgery with: :exception


  # Redirect administrator after log out
  #
  def after_sign_out_path_for(resource_or_scope)
    resource_or_scope == :administrator ? new_administrator_session_path : new_user_session_path
  end

  # Redirect administrator after log in
  #
  def after_sign_in_path_for(resource)
    return administration_root_path if resource.superadmin?
    super
  end

  def layout_by_resource
    if devise_controller? && resource_name == :administrator
      'administration'
    else
      'application'
    end
  end
end
