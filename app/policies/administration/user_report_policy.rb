# frozen_string_literal: true

module Administration
  class UserReportPolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
    end

    def show?
      @user.is?(:superadmin) || @user.has_permission?(:results, :view_report, project_id: project_id)
    end

    def pdf_preview?
      @user.is?(:superadmin) || @user.has_permission?(:results, :view_report, project_id: project_id)
    end

    def download?
      @user.is?(:superadmin) || @user.has_permission?(:results, :view_report, project_id: project_id)
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
    end

    def destroy?
      (@user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)) &&
        record&.not_prepared?
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
    end
  end
end
