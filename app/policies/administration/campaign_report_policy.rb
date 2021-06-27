# frozen_string_literal: true

module Administration
  class CampaignReportPolicy < BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def report_families?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def assessments_and_reports?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :view, @project_id)
    end

    def export?
      @user.is?(:superadmin) || @user.has_client_grant?(:results, :report_data, @project_id)
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def toggle_assessor_access?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_client_grant?(:reports, :manage, @project_id)
    end

    def bulk_download?
      @user.is?(:superadmin) || @user.has_client_grant?(:results, :view_report, @project_id)
    end
  end
end
