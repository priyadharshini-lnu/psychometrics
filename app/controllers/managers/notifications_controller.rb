# frozen_string_literal: true

module Managers
  class NotificationsController < BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def index
      # TODO: add scope
      @resources = policy_scope(@resource_class).order(created_at: :desc, id: :desc).all
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Notification # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
