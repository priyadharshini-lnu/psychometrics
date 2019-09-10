# frozen_string_literal: true

module Managers
  class UsersController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      resource_ids = []
      resource_ids << @current_membership.id unless params[:filter]
      resource_ids << @current_membership.parent_id if !params[:filter] || params[:filter] == 'manager'
      if !params[:filter] || params[:filter] == 'peer'
        resource_ids << @current_membership.siblings.
                        where(client_id: @current_client).pluck(:id)
      end
      if !params[:filter] || params[:filter] == 'report'
        resource_ids << @current_membership.children.
                        where(client_id: @current_client).pluck(:id)
      end
      @resources = policy_scope(@resource_class).enabled.join_user.where(id: resource_ids.flatten.compact).order(:lft)
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Membership # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
