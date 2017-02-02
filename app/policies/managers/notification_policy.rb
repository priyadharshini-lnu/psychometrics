module Managers
  class NotificationPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        assessments_ids = Assign.where(membership_id: @user[:current_membership].id, role: 'manager', assignable_type: Assessment).pluck(:assignable_id)
        membership_ids = @user[:current_membership].children.pluck(:id) + [@user[:current_membership].id]
        scope.where(membership_id: membership_ids, assessment_id: assessments_ids)
      end
    end
  end
end
