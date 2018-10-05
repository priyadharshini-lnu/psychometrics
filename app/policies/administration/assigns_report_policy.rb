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
      if @user.is?(:client_admin)
        @user.client_admin_client_ids.include?(@record.assign.membership.client.tte_id)
      elsif @user.is?(:project_admin)
        @user.project_admin_client_ids.include?(@record.assign.membership.membership_with_result.client_id)
      else
        false
      end
    end
  end
end
