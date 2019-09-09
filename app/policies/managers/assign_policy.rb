# frozen_string_literal: true

module Managers
  class AssignPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      #
      # returns assigns of current_user and assigns of direct reports
      # (if current user was added to relative assessment as 'manager')
      #
      def resolve
        assessment_ids = Assign.where(membership_id: @user[:current_membership].id, role: 'manager').
                         pluck(:assessment_id)
        membership_ids = @user[:current_membership].children.pluck(:id) + [@user[:current_membership].id]
        scope.where(membership_id: membership_ids, assessment_id: assessment_ids)
      end
    end
  end
end
