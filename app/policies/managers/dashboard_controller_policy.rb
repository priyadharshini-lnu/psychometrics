module Managers
  class DashboardControllerPolicy < BasePolicy
    def index?
      @user.is? :manager
    end
  end
end
