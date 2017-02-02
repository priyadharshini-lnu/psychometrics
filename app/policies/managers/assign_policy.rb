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
        assessment_ids = Assessment.enabled.
            joins('LEFT JOIN assigns on assigns.assignable_id = assessments.id and assigns.assignable_type = \'Assessment\'').
            where(assigns: { role: 'manager', membership_id: @user[:current_membership].id }).pluck(:id)
        membership_ids = @user[:current_membership].child_ids + [@user[:current_membership].id]
        scope.where(membership_id: membership_ids, assignable_id: assessment_ids)
      end
    end
  end
end
