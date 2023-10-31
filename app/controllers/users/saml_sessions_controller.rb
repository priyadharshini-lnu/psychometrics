# frozen_string_literal: true

class Users::SamlSessionsController < Devise::SamlSessionsController
  before_action :set_saml_cookie, only: [:new]
  before_action :set_saml_audit_session, only: [:new]
  after_action :reset_saml_audit_session, only: [:create]
  after_action :after_saml_login, only: [:create]

  def set_saml_cookie
    add_cookie(:saml_setting_type, params[:saml_setting_type])
  end

  def set_saml_audit_session
    session['saml_audit'] = true
  end

  def reset_saml_audit_session
    session['saml_audit'] = nil
  end

  def after_saml_login
    return unless user_signed_in?

    audit! :saml_login, current_user, user: current_user, payload: params.except('SAMLResponse', 'RelayState'),
    outcome: 'successful'
    session[:saml_login] = true
    @current_project.saml_setting.make_test_setting_permanent! if cookies[:saml_setting_type] == 'test'
  end

  def auth_options
    { scope: resource_name, recall: nil }
  end
end
