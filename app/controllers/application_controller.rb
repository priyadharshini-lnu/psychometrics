class ApplicationController < ActionController::Base
  # Authorisation flow
  #
  include Pundit
  include Authenticate
  include SetLocale

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
    return 'ecommerce' if request.controller_class.to_s.start_with?('Ecommerce')
    return 'devise' if request.controller_class.to_s.start_with?('Devise')
    return 'devise' if request.controller_class.to_s.start_with?('Users::Registrations')
    return 'devise' if request.controller_class.to_s.start_with?('Users::Invitation')
    'application'
  end

  def pundit_user
    { current_user: current_user, current_client: @current_client, current_project: @current_project, current_membership: @current_membership }
  end

  private

  def user_not_authorized(e)
    render text: 'You does not have access to this page'
  end

  # Detect Client by subdomain
  def set_client_by_subdomain
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Ecommerce')
    subdomain = request.subdomain
    subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '') if Settings.subdomain
    @current_project = Client.enabled.find_by!(subdomain: subdomain)
    @current_client = @current_project.client
  end

  # Fetch membership
  def set_membership
    return if request.controller_class.to_s.start_with?('Administration')
    return if request.controller_class.to_s.start_with?('Ecommerce')
    @current_membership = current_user.memberships.join_user.find_by(client_id: @current_project)
    current_user.current_membership = @current_membership
    if !@current_membership && current_user
      sign_out current_user
      redirect_to("#{request.protocol}#{Settings.domain}:#{request.port}")
    end
  end
end
