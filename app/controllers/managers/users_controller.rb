module Managers
  class UsersController < ApplicationController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize
    layout 'users'

    def index
      @resources = User.order(created_at: :asc, id: :asc).all
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= User
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
