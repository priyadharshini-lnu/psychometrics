module Managers
  class NotificationsController < ApplicationController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize
    layout 'users'

    def index
      # TODO: add scope
      @resources = Notification.order(created_at: :desc, id: :desc).all
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Notification
    end


    def authorize(record, query = nil)
      record = [:managers, record] unless [record].flatten.include? :managers
      super
    end


    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
