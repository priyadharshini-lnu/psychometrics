class Administration::BaseController < ActionController::Base
  # Authorisation flow
  #
  include Pundit
  ## Prepend :administration namespace to policy
  include Administration::Policies
  include Authenticate
  include SetLocale

  # Authentication admin
  prepend_before_action :authenticate_user!

  # Ensuring policies and scopes are used
  append_after_action :verify_authorized, except: :index
  append_after_action :verify_policy_scoped, only: :index

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Custom layout for administration panel
  layout 'administration'

  protect_from_forgery with: :exception

  add_flash_types :notice, :error, :success

  private

  def user_not_authorized
    render plain: 'You does not have access to this page'
  end

  def authenticate_user!
    redirect_to(new_administration_session_path) && return unless user_signed_in?
    super
  end
end
