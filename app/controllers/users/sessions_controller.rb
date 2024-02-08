# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    layout 'devise'
    before_action :check_if_saml_is_enforced, only: [:create]
    before_action :compute_after_signout_path, only: [:destroy]
    before_action :perform_browser_check, only: [:new]
    after_action :redirect_to_return_url, only: [:new]
    skip_before_action :ensure_user_profile_completed, only: [:destroy]
    after_action :set_user_flash_message, only: [:create]

    private

    def set_user_flash_message
      flash[:notice] = I18n.t('devise.sessions.signed_in')
    end

    def after_sign_out_path_for(_)
      @after_signout_path || compute_after_signout_path
    end

    def compute_after_signout_path
      @after_signout_path = if session[:saml_login] && @current_project&.saml_setting&.after_signout_url
                              @current_project.saml_setting.after_signout_url
                            else
                              new_user_session_path
                            end
    end

    def check_if_saml_is_enforced
      redirect_to(new_saml_user_session_path) if @current_project.saml_enforced?
    end

    def redirect_to_return_url
      return if flash[:timedout].blank?
      return if params[:return_url].blank?

      uri = URI.parse params[:return_url]
      uri.query = [uri.query, 'status=session_expired'].compact.join('&')
      redirect_to uri.to_s
    end

    def after_sign_in_path_for(resource)
      flash.delete(:notice)
      resource.memberships.join_user.find_by(client_id: @current_project)&.set_user_invited_for_current_project
      '/'
    end

    def perform_browser_check
      @browser_detections = helpers.detect_browser(request.user_agent)

      redirect_to upgrade_url unless @browser_detections.supported_browser?
    end
  end
end
