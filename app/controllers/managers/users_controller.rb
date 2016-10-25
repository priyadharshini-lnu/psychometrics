module Managers
  class UsersController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      @current_membership = @current_user.memberships.find_by(client_id: @current_client)
      @resources = []
      @resources << @current_membership.parent.includes(:user) if @current_membership.parent
      @resources << @current_membership.self_and_siblings.includes(:user)
      @resources << @current_membership.children.includes(:user)
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
