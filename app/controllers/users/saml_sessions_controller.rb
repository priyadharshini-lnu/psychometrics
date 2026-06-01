# frozen_string_literal: true

class Users::SamlSessionsController < Devise::SamlSessionsController
  include Administration::ClientAdminAuthentication

  before_action :force_logout_existing_user, only: [:new]
  before_action :ensure_sso_enabled_for_client_admin, only: [:new]
  after_action :after_saml_login, only: [:create]

  def force_logout_existing_user
    if user_signed_in?
      sign_out(current_user)
    end
  end

  def after_saml_login
    return unless user_signed_in?

    user = current_user

    if saml_email_intent_mismatch?(user)
      sign_out(user)
      flash.discard(:notice)
      flash[:alert] = I18n.t('admin.sso_email_mismatch')
      return
    end

    setup_client_admin_after_saml_login(user) if client_admin_context?
    return unless user_signed_in?

    audit! :saml_login, user, user: user, payload: params.except('SAMLResponse', 'RelayState').
      merge(email: user.email),
    outcome: 'successful'

    session[:saml_login] = true
  end

  def auth_options
    { scope: resource_name, recall: nil }
  end

  def after_sign_in_path_for(resource)
    if client_admin_context? && Current.client
      "#{admin_path}/clients/#{Current.client.id}/projects"
    else
      extract_return_url_from_relay_state || super
    end
  end

  protected

  def relay_state
    params[:saml_email_token].presence || params[:return_url]
  end

  private

  def client_admin_context?
    Current.client_admin_context?
  end

  def ensure_sso_enabled_for_client_admin
    return unless client_admin_context?

    sso_setting = Current.client&.client_sso_setting
    return if sso_setting&.saml_login_allowed?

    flash[:alert] = I18n.t('admin.sso_not_enabled')
    redirect_to new_administration_session_path
  end

  def setup_client_admin_after_saml_login(user)
    access = AdminAuth::ResolveClientAccess.call(user, Current.client)

    if access[:error]
      sign_out(user)
      flash[:alert] = I18n.t('admin.no_client_access')
      return
    end

    store_client_session_data(access[:ok])
  end

  def saml_email_intent_mismatch?(user)
    token = params[:RelayState].presence
    AdminAuth::SamlIntentToken.email_matches?(token, user.email) == false
  end

  def extract_return_url_from_relay_state
    relay = params[:RelayState].presence
    return nil if relay.blank?

    result = AdminAuth::SamlIntentToken.decode(relay)
    return result.return_url if result

    relay
  end
end
