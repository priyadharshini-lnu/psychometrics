module Managers
  class NotificationPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        membership      = Membership.find_by(client_id: @user[:current_client].id, user_id: @user[:current_user].id)
        assessments_ids = Assign.where(client_id: @user[:current_client].id, user_id: @user[:current_user].id, role: 'manager').pluck(:assessment_id)
        @user[:current_client]
            .notifications
            .where({
                       user_id:       membership.children.pluck(:user_id) + [@user[:current_user].id],
                       assessment_id: assessments_ids
                   })
      end
    end
  end
end
