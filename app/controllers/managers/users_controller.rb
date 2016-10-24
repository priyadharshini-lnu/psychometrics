module Managers
  class UsersController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      @resources = policy_scope(@resource_class).
                   with_client(@current_client).
                   where.not(user_id: @current_user).
                   includes(:user).
                   order(id: :asc).
                   all
      @current_membership = @current_user.memberships.find_by(client_id: @current_client)
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Membership
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
