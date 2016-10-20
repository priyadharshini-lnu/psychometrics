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

  # append_before_action :set_company_by_user, if: :pundit_user

  def layout_by_resource
    return 'devise' if request.controller_class.to_s.start_with?('Administration')
    'application'
  end

  def pundit_user
    CurrentContext.new(current_user, @current_client)
  end

  private

  def set_client_by_subdomain
    subdomain = request.subdomain
    subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '')
    @current_client = Client.find_by(subdomain: subdomain) unless subdomain.blank?
  end

  def set_company_by_user
    # Set first Client of User:
    # * IF Domain not provide Client
    # * IF User has no Client provided by subdomain
    @current_client = pundit_user.try(:clients).try(:first) unless @current_client || (pundit_user.try(:client_ids) || []).include?(@current_client.try(:id))
    sign_out current_user if current_user && !@current_client
    redirect_to administration_root_path if current_user && !@current_client
  end

  def authenticate
    return if Rails.env.development?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
