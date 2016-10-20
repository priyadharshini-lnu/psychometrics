module Managers
  class NotificationPolicy < BasePolicy
    def index?
      @user.is? :manager
    end

    class Scope < Scope
      def resolve
        @user.client.notifications
      end
    end
  end
end
