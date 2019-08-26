module Administration
  class BaseController < ::BaseController
    include Administration::Policies
    include Administration::Helpers
    layout 'administration'

    append_after_action :verify_authorized, except: :index
    append_after_action :verify_policy_scoped, only: :index

    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    private

    def user_not_authorized
      render plain: 'You does not have access to this page', status: 403
    end

    def authenticate_user!
      if user_signed_in?
        sign_out current_user unless current_user.is?(:superadmin, :client_admin, :project_admin)
      end
      super
    end

    def pundit_authorize
      authorize resource || resource_class
    end

    def set_resource
      @_resource = policy_scope(resource_class).find(params[:id])
    end

    def resource=(resource)
      @_resource = resource
    end
  end
end
