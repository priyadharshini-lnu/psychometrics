# frozen_string_literal: true

module Administration
  class ProjectPolicy < Administration::BasePolicy
    def index?
      super || @user.has_permission?(:projects, :view, project_id: project_id)
    end

    def manage_project_admins?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage_admins, project_id: project_id)
    end

    def manage_project_smtp_settings?
      @user.is?(:superadmin) || @user.has_permission?(
        :project_settings, :smtp, project_id: project_id
      )
    end
  end
end
