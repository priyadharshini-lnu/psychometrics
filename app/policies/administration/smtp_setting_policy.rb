# frozen_string_literal: true

module Administration
  class SmtpSettingPolicy < Administration::BasePolicy
    def update?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, record.project_id)
    end
  end
end
