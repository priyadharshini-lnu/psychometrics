module Administration
  class AssignsReportPolicy < Administration::BasePolicy
    def edit?
      super || @user.has_grant?(:assessments, :assign)
    end

    def update?
      super || @user.has_grant?(:assessments, :assign)
    end

    def destroy?
      return true if @user.is?(:superadmin)
      return false unless @user.has_grant?(:assessments, :assign)
      @user.project_admin_client_ids.include?(@record.assign.membership.client_id)
    end
  end
end
