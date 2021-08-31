# frozen_string_literal: true

module Administration::Threesixty
  class CampaignPolicy < Administration::Threesixty::BasePolicy
    def show?
      super_admins_or_admins?
    end

    def index?
      super_admins_or_admins?
    end

    def assessments?
      super_admins_or_admins?
    end

    def campaign_templates?
      super_admins_or_admins?
    end

    def factors?
      super_admins_or_admins?
    end

    def reset?
      super_admins_or_admins?
    end

    def reset_nominations?
      super_admins_or_admins?
    end

    def export_completion_status?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def export_results?
      super_admins_or_admins?
    end

    def remove_user?
      super_admins_or_admins?
    end

    def edit?
      super_admins_or_admins?
    end

    def update?
      super_admins_or_admins?
    end

    def edit_subject_report?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id: project_id)
    end

    def manage_reports_options?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_options, project_id: project_id)
    end

    def manage_campaign_options?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_options, project_id: project_id)
    end
  end
end
