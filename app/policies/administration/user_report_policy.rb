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
      return true if @user.is?(:superadmin)

      can_view_report = @user.has_permission?(:results, :view_report, project_id: project_id, campaign_id: campaign_id)
      return can_view_report unless @record.report.require_approval?

      @record.approved? && can_view_report
    end

    def approve?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :view_report, project_id: project_id, campaign_id: campaign_id
      )
    end

    def regenerate?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
    end

    def destroy?
      (@user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )) && record&.not_prepared?
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
