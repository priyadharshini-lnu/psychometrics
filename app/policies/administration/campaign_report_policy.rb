# frozen_string_literal: true

module Administration
  class CampaignReportPolicy < BasePolicy
    def create?
      can_manage_campaign_and_users?
    end

    def destroy?
      has_permission?(:campaigns, :manage)
    end

    def report_families?
      can_manage_campaign_and_users?
    end

    def assessments_and_reports?
      has_permission?(:campaigns, :view)
    end

    def other?
      has_permission?(:campaigns, :view)
    end

    def export?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :report_data, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_user_access?
      can_manage_campaign_and_users?
    end

    def toggle_assessor_access?
      can_manage_campaign_and_users?
    end

    def toggle_auto_assign?
      can_manage_campaign_and_users?
    end

    def toggle_user_dashboard?
      can_manage_campaign_and_users?
    end

    def toggle_main_report?
      can_manage_campaign_and_users?
    end

    def regenerate?
      has_permission?(:results, :bulk_regenerate_reports)
    end

    def bulk_download?
      has_permission?(:results, :bulk_download)
    end

    def can_manage_campaign_and_users?
      has_permission?(:campaigns, :manage) && has_permission?(:campaigns, :manage_users)
    end
  end
end
