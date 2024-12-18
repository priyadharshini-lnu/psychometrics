# frozen_string_literal: true

module Administration
  class CampaignReportPolicy < BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def report_families?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def assessments_and_reports?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def other?
      assessments_and_reports?
    end

    def export?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :report_data, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_assessor_access?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_auto_assign?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_user_dashboard?
      @user.has_permission?(:campaigns, :manage_users)
    end

    def toggle_main_report?
      @user.has_permission?(:campaigns, :manage_users)
    end

    def regenerate?
      @user.is?(:superadmin) || has_permission?(:results, :bulk_regenerate_reports)
    end

    def bulk_download?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :bulk_download, project_id: project_id, campaign_id: campaign_id
      )
    end
  end
end
