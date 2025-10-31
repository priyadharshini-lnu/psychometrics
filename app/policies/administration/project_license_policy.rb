# frozen_string_literal: true

module Administration
  class ProjectLicensePolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:projects,
                                                 :view_licenses) || @user.has_grant?(:projects, :manage_licenses)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_licenses)
    end

    def update?
      @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_licenses)
    end

    def license_usages?
      @user.is?(:superadmin) || @user.has_grant?(:projects,
                                                 :view_licenses) || @user.has_grant?(:projects, :manage_licenses)
    end
  end
end
