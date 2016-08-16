class Administration::BaseController < ActionController::Base
  # Authorisation flow
  #
  include Pundit
  ## Prepend :administration namespace to policy
  include Administration::Policies
  ## Custom current user helper for Pundit
  def pundit_user
    current_administrator
  end

  # Ensuring policies and scopes are used
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  # Custom layout for administration panel
  layout 'administration'

  # Authentication admin
  before_action :authenticate_administrator!

  protect_from_forgery with: :exception

  add_flash_types :notice, :error, :success
end
