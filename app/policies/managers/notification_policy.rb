module Managers
  class NotificationPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        membership = Membership.find_by(client_id: @user[:current_client].id, user_id: @user[:current_user].id)
        @user[:current_client].notifications.where(user_id: membership.children.pluck(:user_id) + [@user[:current_user].id])
      end
    end
  end
end
