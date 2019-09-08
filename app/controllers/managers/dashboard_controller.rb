# frozen_string_literal: true

module Managers
  class DashboardController < ApplicationController
    layout 'users'
    append_before_action :pundit_authorize
    after_action :skip_policy_scope

    def index
      @notifications = policy_scope([:managers, Notification]).order(created_at: :desc, id: :desc).all
    end

    private

    def pundit_authorize
      authorize self
    end
  end
end
