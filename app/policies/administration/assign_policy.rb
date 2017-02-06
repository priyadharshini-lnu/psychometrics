module Administration
  class AssignPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:assigns, :view)
    end

    def import?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    def create?
      super || @user.has_grant?(:assessments, :assign)
    end

    def destroy?
      return true if @user.is?(:superadmin)
      @user.admin_client_ids.include?(@record.membership.client_id) && @user.has_grant?(:assessments, :assign)
    end

    def destroy_report?
      return true if @user.is?(:superadmin)
      @user.admin_client_ids.include?(@record.membership.client_id) && @user.has_grant?(:assessments, :assign)
    end

    def statistics?
      @user.is?(:superadmin, :admin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        assessment_ids = Assign.joining { membership }.where.has { |ass| ass.membership.user_id.eq(@user.id) }.pluck(:assessment_id)
        scope.where(assessment_id: assessment_ids)
      end
    end
  end
end
