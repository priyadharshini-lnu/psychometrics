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
      show?
    end

    def download?
      show?
    end

    def regenerate?
      create?
    end

    def destroy?
      (@user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)) &&
        record&.not_prepared?
    end

    def toggle_user_access?
      create?
    end
  end
end
