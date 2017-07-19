class Administration::BaseController < ActionController::Base
  include Pundit
  include Authenticate
  include SetLocale
  include Administration::Policies
  include Administration::Helpers

  prepend_before_action :authenticate_user!
  append_after_action :verify_authorized, except: :index
  append_after_action :verify_policy_scoped, only: :index

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  layout 'administration'

  private

  def user_not_authorized
    render plain: 'You does not have access to this page', status: 403
  end

  def authenticate_user!
    if user_signed_in?
      sign_out current_user unless current_user.is?(:superadmin, :admin)
    end
    super
  end

  def pundit_authorize
    authorize resource || resource_class
  end

  def set_resource
    @_resource = policy_scope(resource_class).find(params[:id])
  end
end
