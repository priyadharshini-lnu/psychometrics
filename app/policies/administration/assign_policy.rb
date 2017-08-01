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

    # Permission to view statistics link
    def statistics?
      @user.is?(:superadmin, :admin)
    end

    # Permission to clients/users/assigns#reports
    def reports?
      @user.is?(:superadmin, :admin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:assigns, :view)
          admin_client_ids = @user.admin_client_ids
          client_end_levels = Client.end_level.where('id in (?) or ancestry ~ ?', admin_client_ids, "/(#{admin_client_ids.join('|')})(/|$)")
          return scope.joins(:membership).where(memberships: { client_id: client_end_levels.ids })
        end
        scope.none
      end
    end
  end
end
