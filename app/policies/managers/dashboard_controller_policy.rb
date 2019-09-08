# frozen_string_literal: true

module Managers
  class DashboardControllerPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end
  end
end
