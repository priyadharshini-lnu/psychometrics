# frozen_string_literal: true

class Users::SamlSessionsController < Devise::SamlSessionsController
  before_action :force_logout_existing_user, only: [:new]
  before_action :set_saml_auth_session, only: [:new]
  after_action :reset_saml_auth_session, only: [:create]
  after_action :after_saml_login, only: [:create]

  def set_saml_auth_session
    session['saml_auth'] = true
  end

  def reset_saml_auth_session
    session['saml_auth'] = nil
  end

  def force_logout_existing_user
    if user_signed_in?
      sign_out(current_user)
    end
  end

  def after_saml_login
    return unless user_signed_in?

    audit! :saml_login, current_user, user: current_user, payload: params.except('SAMLResponse', 'RelayState').
      merge(email: current_user.email),
    outcome: 'successful'
    session[:saml_login] = true
  end

  def auth_options
    { scope: resource_name, recall: nil }
  end
end
