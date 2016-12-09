module Administration
  class AssignPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def import?
      @user.is?(:superadmin)
    end

    def statistics?
      @user.is?(:superadmin, :admin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        assessment_ids = Assign.joining { membership }.where.has { |ass| ass.role.eq(:admin) | ass.membership.user_id.eq(@user.id) }.pluck(:assessment_id)
        scope.where(assessment_id: assessment_ids)
      end
    end
  end
end
