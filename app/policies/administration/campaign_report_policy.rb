# frozen_string_literal: true

module Administration
  class CampaignReportPolicy < BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def report_families?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def assessments_and_reports?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def export?
      @user.is?(:superadmin) || @user.has_grant?(:results, :report_data)
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def toggle_assessor_access?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def bulk_download?
      @user.is?(:superadmin) || @user.has_grant?(:results, :view_report)
    end
  end
end
