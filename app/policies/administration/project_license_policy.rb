# frozen_string_literal: true

module Administration
  class ProjectLicensePolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :view_licenses)
    end

    def show?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :view_licenses)
    end
  end
end
