# frozen_string_literal: true

module Administration::Threesixty
  class CampaignPolicy < Administration::Threesixty::BasePolicy
    def show?
      super_admins_or_admins?
    end

    def index?
      has_permission?(:campaigns, :view)
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

    def edit_participant_options?
      has_permission?(:campaigns, :participant_options)
    end

    def edit_report_options?
      has_permission?(:campaigns, :report_options)
    end

    def access_email_messages?
      has_permission?(:messages, :email)
    end

    def access_instruction_messages?
      has_permission?(:messages, :instructions)
    end

    def access_messages_options?
      has_permission?(:messages, :options)
    end

    def edit_assessment?
      has_permission?(:assessments, :manage)
    end

    def edit_report?
      has_permission?(:reports, :manage)
    end

    def edit_dimension?
      has_permission?(:dimensions, :manage)
    end

    def manage_relationships?
      has_permission?(:campaigns, :manage)
    end

    def reset?
      has_permission?(:campaigns, :manage)
    end

    def reset_nominations?
      has_permission?(:campaigns, :reset_nominations)
    end

    def rescore_assessment?
      has_permission?(:results, :rescore_responses)
    end

    def export_completion_status?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def export_results?
      has_permission?(:results, :raw_responses)
    end

    def remove_user?
      has_permission?(:campaigns, :manage_users)
    end

    def edit?
      has_permission?(:campaigns, :manage)
    end

    def update?
      has_permission?(:campaigns, :manage)
    end

    def manage_reports_options?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_options, project_id: project_id)
    end

    def manage_campaign_options?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_options, project_id: project_id)
    end
  end
end
