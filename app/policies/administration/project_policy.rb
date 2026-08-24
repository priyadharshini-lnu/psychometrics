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

    def manage_project_privacy_setting?
      has_permission?(:project_settings, :privacy_settings, project_id: project_id)
    end

    def manage_project_assessments?
      has_permission?(:project_settings, :assessments, project_id: project_id)
    end

    def view_audit_reports?
      has_permission?(:audit_reports, :user_report_events, project_id: project_id) ||
        has_permission?(:audit_reports, :admin_permissions, project_id: project_id)
    end

    def view_communication_center?
      Settings.features.communication_center_enabled &&
        Client.communication_center_active?(project_id: project_id, campaign_id: campaign_id) &&
        (@user.is?(:superadmin) || has_permission?(:communications, :view, project_id: project_id))
    end

    def access_project_taxonomy?
      has_permission?(:skills, :view, project_id: project_id)
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
