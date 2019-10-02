# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    layout 'devise'
    after_action :redirect_to_return_url, only: [:new]

    private

    def redirect_to_return_url
      return if flash[:timedout].blank?
      return if params[:return_url].blank?

      uri = URI.parse params[:return_url]
      uri.query = [uri.query, 'status=session_expired'].compact.join('&')
      redirect_to uri.to_s
    end

    def after_sign_in_path_for(_)
      '/'
    end
  end
end
