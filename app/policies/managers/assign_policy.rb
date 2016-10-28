module Managers
  class AssignPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      #
      # returns assigns of current_user and assigns of direct reports (if current user was added to relative assessment as 'manager')
      #
      def resolve
        # TODO: Better send to context membership
        membership = Membership.find_by(client_id: @user[:current_client].id, user_id: @user[:current_user].id)
        assessments_ids = Assign.where(client_id: @user[:current_client].id, user_id: @user[:current_user].id, role: 'manager').pluck(:assessment_id)
        query_my = @user[:current_client].assigns.where({ user_id: @user[:current_user].id })
        @user[:current_client].assigns.where({
            user_id:       membership.children.pluck(:user_id) + [@user[:current_user].id],
            assessment_id: assessments_ids
          }).
          or(query_my)
      end
    end
  end
end
