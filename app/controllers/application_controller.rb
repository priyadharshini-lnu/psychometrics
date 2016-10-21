class ApplicationController < ActionController::Base
  # Authorisation flow
  #
  include Pundit

  layout :layout_by_resource
  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  prepend_before_action :set_client_by_subdomain
  prepend_before_action :authenticate

  # Authentication user/manager
  before_action :authenticate_user!
  append_before_action :set_client_by_user, if: :current_user

  def layout_by_resource
    return 'devise' if request.controller_class.to_s.start_with?('Administration')
    'application'
  end

  def pundit_user
    { current_user: current_user, current_client: @current_client }
  end

  private

  def set_client_by_subdomain
    subdomain = request.subdomain
    subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '')
    # render text: 'Please clarify correct url' if subdomain.blank?
    @current_client = Client.find_by(subdomain: subdomain) unless subdomain.blank?
  end

  def set_client_by_user
    @current_client = current_user.try(:clients).try(:first) unless @current_client
  end

  def authenticate
    return if Rails.env.development?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
