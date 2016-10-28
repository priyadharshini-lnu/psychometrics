module Administration
  class AssignPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        assessment_ids = @user.assigns.where(role: :admin).pluck(:assessment_id)
        scope.where(assessment_id: assessment_ids)
      end
    end
  end
end
