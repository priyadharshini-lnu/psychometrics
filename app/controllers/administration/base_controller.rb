class Administration::BaseController < ActionController::Base
  # Authorisation flow
  #
  include Pundit
  ## Prepend :administration namespace to policy
  include Administration::Policies
  ## Custom current user helper for Pundit
  def pundit_user
    current_user
  end

  # Authentication admin
  prepend_before_action :authenticate_user!
  prepend_before_action :authenticate

  # Ensuring policies and scopes are used
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  # Custom layout for administration panel
  layout 'administration'

  protect_from_forgery with: :exception

  add_flash_types :notice, :error, :success

  private

  def authenticate_user!
    redirect_to(new_administration_session_path) && return unless user_signed_in?
    super
  end

  def authenticate
    return if Rails.env.development?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
