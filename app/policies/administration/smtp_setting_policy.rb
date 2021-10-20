# frozen_string_literal: true

module Administration
  class SmtpSettingPolicy < Administration::BasePolicy
    def update?
      can_manage_smtp_setting?
    end

    def validate_settings?
      can_manage_smtp_setting?
    end

    def send_test_email?
      can_manage_smtp_setting?
    end

    private

    def can_manage_smtp_setting?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id: project_id)
    end
  end
end
