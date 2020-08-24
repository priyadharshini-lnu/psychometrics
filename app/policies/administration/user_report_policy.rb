# frozen_string_literal: true

module Administration
  class UserReportPolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def show?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end

    def pdf_preview?
      show?
    end

    def download?
      show?
    end
  end
end
