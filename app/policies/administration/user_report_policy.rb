# frozen_string_literal: true

module Administration
  class UserReportPolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def upload_file?
      has_permission?(:results, :report_file_upload)
    end

    def remove_file?
      has_permission?(:results, :report_file_upload)
    end

    def show?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :view_report, project_id: project_id, campaign_id: campaign_id
      ) || ReportApprovalSetting.where_participate(@user.id, campaign_id).exists?(report_id: record.report_id)
    end

    def pdf_preview?
      has_permission?(:results, :download_report) ||
        ReportApprovalSetting.notifications(@user.id, campaign_id).exists?(report_id: record.report_id)
    end

    def download?
      has_permission?(:results, :download_report) ||
        ReportApprovalSetting.notifications(@user.id, campaign_id).exists?(report_id: record.report_id)
    end

    def webhook_payload?
      has_permission?(:project_settings, :webhooks, project_id: project_id)
    end

    def possible_webhook_events?
      has_permission?(:project_settings, :webhooks, project_id: project_id)
    end

    def push_webhook?
      @user.has_permission?(
        :project_settings, :webhooks, project_id: project_id
      ) && (record.publish_results_available? || record.has_user_results?)
    end

    def approve?
      manage_approval?
    end

    def translate?
      project = Project.find_by(id: project_id)
      if show?
        project.client.feature_enabled?(:ai_translation) && project.project_feature_enabled?(:ai_translation)
      end
    end

    def start_qc?
      return true if @user.is?(:superadmin)

      user_qc?
    end

    def abort_qc?
      return true if @user.is?(:superadmin)

      user_qc?
    end

    def send_for_approval?
      (manage_approval? && approvers_can_edit?) || edit_qc?
    end

    def request_changes?
      manage_approval?
    end

    def remove_approval?
      manage_approval?
    end

    def mark_ready?
      return true if @user.is?(:superadmin)

      user_qc?
    end

    def regenerate?
      @user.is?(:superadmin) || has_permission?(:results, :regenerate_report)
    end

    def bulk_download?
      has_permission?(:results, :download_report)
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

    def dashboard?
      has_permission?(:dashboards, :view)
    end

    def edit_qc?
      return true if @user.is?(:superadmin)

      user_qc? || approvers_can_edit?
    end

    def manage_approval?
      return true if @user.is?(:superadmin)

      one_level_qc? || user_approver?
    end

    def one_level_qc?
      approval_setting = ReportApprovalSetting.find_by(campaign_id: @record.campaign.id, report_id: @record.report_id)

      user_qc? && approval_setting.approvers_not_required?
    end

    def approvers_can_edit?
      approval_setting = ReportApprovalSetting.find_by(campaign_id: @record.campaign.id, report_id: @record.report_id)

      user_approver? && approval_setting.approvers_can_edit?
    end

    private

    def user_approver?
      ReportApprovalSetting.approvers(@user.id, @record.campaign.id).exists?(report_id: @record.report_id)
    end

    def user_qc?
      ReportApprovalSetting.qcs(@user.id, @record.campaign.id).exists?(report_id: @record.report_id)
    end
  end
end
