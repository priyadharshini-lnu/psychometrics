class ApplicationController < ActionController::Base
  # Authorisation flow
  #
  include Pundit
  include Authenticate

  layout :layout_by_resource
  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  # Authentication user/manager
  prepend_before_action :authenticate_user!
  before_action :set_client_by_subdomain
  append_before_action :set_membership, if: :user_signed_in?

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def layout_by_resource
    return 'devise' if request.controller_class.to_s.start_with?('Administration')
    'application'
  end

  def pundit_user
    { current_user: current_user, current_client: @current_client }
  end

  private

  def user_not_authorized
    render text: 'You does not have access to this page'
  end

  # Detect Client by subdomain
  def set_client_by_subdomain
    return if request.controller_class.to_s.start_with?('Administration')
    subdomain = request.subdomain
    subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '')
    @current_client = Client.find_by!(subdomain: subdomain)
  end

  # Fetch membership
  def set_membership
    return if request.controller_class.to_s.start_with?('Administration')
    @current_membership = current_user.memberships.find_by!(client_id: @current_client)
  end
end
