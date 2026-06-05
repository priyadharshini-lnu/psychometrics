# frozen_string_literal: true

class Users::SamlSessionsController < Devise::SamlSessionsController
  before_action :force_logout_existing_user, only: [:new]
  after_action :after_saml_login, only: [:create]

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

  def after_sign_in_path_for(_resource)
    params[:RelayState].presence || '/'
  end

  protected

  def relay_state
    params[:return_url]
  end
end
