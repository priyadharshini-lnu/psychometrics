# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    layout 'devise'
    before_action :detect_browser, only: [:new]
    after_action :redirect_to_return_url, only: [:new]

    private

    def redirect_to_return_url
      return if flash[:timedout].blank?
      return if params[:return_url].blank?

      uri = URI.parse params[:return_url]
      uri.query = [uri.query, 'status=session_expired'].compact.join('&')
      redirect_to uri.to_s
    end

    def after_sign_in_path_for(resource)
      resource.memberships.join_user.find_by(client_id: @current_project)&.set_user_invited_for_current_project
      '/'
    end

    def detect_browser
      browser = Browser.new(request.user_agent)
      @browser_detections = BrowserDetector.new.detect(browser)

      redirect_to upgrade_url unless @browser_detections.supported_browser?
    end
  end
end
