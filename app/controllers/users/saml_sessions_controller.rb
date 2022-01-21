# frozen_string_literal: true

class Users::SamlSessionsController < Devise::SamlSessionsController
  before_action :set_saml_cookie, only: [:new]
  after_action :after_saml_login, only: [:create]

  def set_saml_cookie
    add_cookie(:saml_setting_type, params[:saml_setting_type])
  end

  def after_saml_login
    return unless user_signed_in?

    session[:saml_login] = true
    @current_project.saml_setting.make_test_setting_permanent! if cookies[:saml_setting_type] == 'test'
  end

  def auth_options
    { scope: resource_name, recall: nil }
  end
end
