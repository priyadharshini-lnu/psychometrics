# frozen_string_literal: true

module Administration
  class SecuritySettingPolicy < Administration::BasePolicy
    def update?
      can_manage_password_setting?
    end

    private

    def can_manage_password_setting?
      @user.is?(:superadmin) || @user.has_permission?(:project_settings, :password, project_id: project_id)
    end
  end
end
