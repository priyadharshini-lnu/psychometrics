# frozen_string_literal: true

module Administration
  class UserReportPolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
    end

    def show?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :view_report, project_id: project_id, campaign_id: campaign_id
      )
    end

    def pdf_preview?
      @user.is?(:superadmin) || @user.has_permission?(:results, :view_report, project_id: project_id)
    end

    def download?
      show?
    end

    def approve?
      @user.has_permission?(
        :results, :approve_report, project_id: project_id, campaign_id: campaign_id
      )
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
    end

    def destroy?
      @user.is?(:superadmin)
    end

    def toggle_user_access?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def index?
      @user.has_permission?(
        :campaigns, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def results?
      @user.has_permission?(
        :results, :report_data, project_id: project_id, campaign_id: campaign_id
      )
    end

    def pdf?
      @user.has_permission?(
        :results, :view_report, project_id: project_id, campaign_id: campaign_id
      )
    end
  end
end
