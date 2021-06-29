# frozen_string_literal: true

module Administration
  class UserReportPolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_grant?(:campaign, :manage_users)
    end

    def show?
      @user.is?(:superadmin) || @user.has_grant?(:results, :view_report)
    end

    def pdf_preview?
      @user.is?(:superadmin) || @user.has_grant?(:results, :view_report)
    end

    def download?
      @user.is?(:superadmin) || @user.has_grant?(:results, :view_report)
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_grant?(:campaign, :manage_users)
    end

    def destroy?
      (@user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)) &&
        record&.not_prepared?
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_grant?(:campaign, :manage_users)
    end
  end
end
