module Managers
  class UsersController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      resource_ids = []
      resource_ids << @current_membership.id unless params[:filter]
      resource_ids << @current_membership.parent_id if !params[:filter] || params[:filter] == 'manager'
      resource_ids << @current_membership.siblings.where(client_id: @current_client).pluck(:id) if !params[:filter] || params[:filter] == 'peer'
      resource_ids << @current_membership.children.where(client_id: @current_client).pluck(:id) if !params[:filter] || params[:filter] == 'report'
      @resources = policy_scope(@resource_class).join_user.where(id: resource_ids.flatten.compact).order(:lft)
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
