# frozen_string_literal: true

module Administration::Threesixty
  class CampaignPolicy < Administration::Threesixty::BasePolicy
    def show?
      has_permission?(:campaigns, :view)
    end

    def index?
      has_permission?(:campaigns, :view)
    end

    def factors?
      has_permission?(:campaigns, :view)
    end

    def manage_admins?
      has_permission?(:campaigns, :manage_admins)
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

    def manage_factor_benchmark_scores?
      has_permission?(:campaigns, :manage_factor_benchmark_scores)
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

    def regenerate_reports?
      has_permission?(:results, :bulk_regenerate_reports)
    end

    def regenerate_report?
      has_permission?(:results, :regenerate_report)
    end

    alias bulk_regenerate_reports? regenerate_reports?

    def export_completion_status?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def export_results?
      has_permission?(:results, :raw_responses)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :reset_responses, project_id: project_id, campaign_id: campaign_id
      )
    end

    def export_threesixty_scores?
      has_permission?(:results, :scores)
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
      has_permission?(:campaigns, :report_options)
    end
  end
end
