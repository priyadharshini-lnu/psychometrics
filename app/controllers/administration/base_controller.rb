class Administration::BaseController < ActionController::Base
  include Pundit
  include Authenticate
  include SetLocale
  include Administration::Policies
  include Administration::Helpers

  # Authentication admin
  prepend_before_action :authenticate_user!

  # Ensuring policies and scopes are used
  append_after_action :verify_authorized, except: :index
  append_after_action :verify_policy_scoped, only: :index

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  layout 'administration'

  private

  def user_not_authorized
    raise ActionController::RoutingError.new('Not Found')
  end

  def authenticate_user!
    redirect_to(new_administration_session_path) && return unless user_signed_in?
    raise Pundit::NotAuthorizedError unless current_user.is?(:superadmin, :admin)
    super
  end

  def set_resource
    @resource = policy_scope(@resource_class).find(params[:id])
  end
end
