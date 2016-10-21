module Managers
  class NotificationPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        @user[:current_client].notifications
      end
    end
  end
end
