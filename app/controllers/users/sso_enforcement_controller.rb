# frozen_string_literal: true

module Users
  class SsoEnforcementController < ApplicationController
    skip_before_action :authenticate_user!

    prepend_before_action :verify_recaptcha_or_redirect, only: [:check_sso]

    def check_sso
      email = params.dig(:user, :email)

      if @current_project.saml_setting&.sso_enforced_for_email?(email)
        redirect_to new_saml_user_session_path(return_url: stored_location_for(:user))
      else
        session[:user_email] = email
        redirect_to new_user_session_path
      end
    end

    private

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
