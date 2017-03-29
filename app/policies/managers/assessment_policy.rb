module Managers
  class AssessmentPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        assessments_ids = Assign.where(role: Assign.roles[:manager], membership_id: @user[:current_membership].id).
                          pluck(:assessment_id).uniq
        scope.where(category: Assessment.categories[:organisational], id: assessments_ids, status: Assessment.statuses[:finished])
      end
    end
  end
end
