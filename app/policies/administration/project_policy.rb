# frozen_string_literal: true

module Administration
  class ProjectPolicy < Administration::BasePolicy
    def index?
      super || @user.has_permission?(:projects, :view, project_id: project_id)
    end

    def show?
      can_view_project?
    end

    def create?
      can_manage_project?
    end

    def update?
      can_manage_project?
    end

    def manage_project_admins?
      has_permission?(:projects, :manage_admins, project_id: project_id)
    end

    def manage_project_smtp_settings?
      has_permission?(
        :project_settings, :smtp, project_id: project_id
      )
    end

    def manage_project_webhooks?
      has_permission?(
        :project_settings, :webhooks, project_id: project_id
      )
    end

    private

    def can_manage_project?
      has_permission?(:projects, :manage, project_id: project_id)
    end

    def can_view_project?
      @user.has_permission?(:projects, :view, project_id: project_id)
    end
  end
end
