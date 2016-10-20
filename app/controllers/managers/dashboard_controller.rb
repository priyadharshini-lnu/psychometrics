module Managers
  class DashboardController < ApplicationController
    layout 'users'
    append_before_action :pundit_authorize

    def index
      # TODO: add scope
      @notifications = Notification.order(created_at: :desc, id: :desc).all
    end

    private

    def pundit_authorize
      authorize self
    end
  end
end
