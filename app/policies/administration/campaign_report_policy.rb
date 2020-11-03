# frozen_string_literal: true

module Administration
  class CampaignReportPolicy < BasePolicy
    def report_families?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def assessments_and_reports?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def export?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end

    def bulk_download?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end
  end
end
