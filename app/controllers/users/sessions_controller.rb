# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    layout 'devise'

    prepend_before_action :verify_recaptcha_or_redirect, only: [:create]
    before_action :check_if_saml_is_enforced, only: [:create]
    before_action :compute_after_signout_path, only: [:destroy]
    before_action :redirect_external_logout_url, only: [:new]
    before_action :perform_browser_check, only: [:new]
    skip_before_action :ensure_user_profile_completed, only: [:destroy]
    after_action :set_user_flash_message, only: [:create]
    after_action :set_return_url_for_redirect, only: [:new]

    def destroy
      logged_in_user = current_user
      impersonator_id = session[:impersonated_by_id]
      super do
        session.delete(:impersonated_by_id)
        audit!(
          :sign_out, logged_in_user,
          user: logged_in_user,
          payload: { email: logged_in_user.email },
          impersonated_by_id: impersonator_id
        )
        Utility::Cookie.expire_auth_cookies(response)
        WardenAuthLogger.log_sign_out(logged_in_user, request, scope: :user)
        session[:proctoring_mode] = false
      end
    end

    private

    def redirect_external_logout_url
      redirect_to(external_logout_url) if external_logout_available?
    end

    def set_return_url_for_redirect
      store_location_for(:user, params[:return_url]) if params[:return_url].present?
    end

    def set_user_flash_message
      flash[:notice] = I18n.t('devise.sessions.signed_in')
    end

    def after_sign_out_path_for(_)
      @after_signout_path || compute_after_signout_path
    end

    def compute_after_signout_path
      @after_signout_path = determine_target_path
    end

    def determine_target_path
      return saml_signout_url if saml_signout_available?
      return external_logout_url if external_logout_available?

      new_user_session_path
    end

    def saml_signout_available?
      session[:saml_login].present? && @current_project&.saml_setting&.after_signout_url.present?
    end

    def saml_signout_url
      @current_project&.saml_setting&.after_signout_url
    end

    def external_logout_available?
      cookies[:sso_session] == 'true' && @current_project&.security_setting&.external_logout_redirect_enabled == true
    end

    def external_logout_url
      cookies.delete(:sso_session)
      @current_project&.security_setting&.external_logout_url
    end

    def check_if_saml_is_enforced
      redirect_to(new_saml_user_session_path(return_url: stored_location_for(:user))) if @current_project.saml_enforced?
    end

    def after_sign_in_path_for(resource)
      flash.delete(:notice)
      resource.memberships.join_user.find_by(client_id: @current_project)&.set_user_invited_for_current_project
      stored_location_for(:user) || '/'
    end

    def perform_browser_check
      @browser_detections = helpers.detect_browser(request.user_agent)

      redirect_to upgrade_url unless @browser_detections.supported_browser?
    end

    def verify_recaptcha_or_redirect
      return if SkipRecaptcha.call!(request)

      @current_project = GetProjectBySubdomain.call!(request.subdomain)
      return unless @current_project&.security_setting&.enable_recaptcha

      unless verify_recaptcha(response: params[:recaptcha_token])
        flash[:alert] = I18n.t('sessions.errors.recaptcha')
        redirect_to new_user_session_path and return
      end
    end
  end
end
