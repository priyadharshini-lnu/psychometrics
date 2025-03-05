# frozen_string_literal: true

module Administration
  class TextModuleOverridePolicy < Administration::BasePolicy
    def initialize(_, _, data)
      super
      @user_report = UserReport.find(data[:user_report_id]) if data[:user_report_id]
    end

    def create?
      edit_qc?
    end

    def update?
      edit_qc?
    end

    def edit_qc?
      return true if @user.is?(:superadmin)

      (manage_approval? && approvers_can_edit?) ||
        ReportApprovalSetting.qcs(@user.id, @user_report.campaign.id).exists?(report_id: @user_report.report_id)
    end

    def approve?
      return true if @user.is?(:superadmin)

      one_level_qc? ||
        ReportApprovalSetting.approvers(@user.id, @user_report.campaign.id).exists?(report_id: @user_report.report_id)
    end

    def disapprove?
      return true if @user.is?(:superadmin)

      one_level_qc? ||
        ReportApprovalSetting.approvers(@user.id, @user_report.campaign.id).
          exists?(report_id: @user_report.report_id)
    end

    private

    def manage_approval?
      return true if @user.is?(:superadmin)

      one_level_qc? ||
        ReportApprovalSetting.approvers(@user.id, @user_report.campaign.id).
          exists?(report_id: @user_report.report_id)
    end

    def one_level_qc?
      approval_setting = ReportApprovalSetting.find_by(campaign_id: @user_report.campaign.id,
                                                       report_id: @user_report.report_id)

      approval_setting.approvers_not_required?
    end

    def approvers_can_edit?
      approval_setting = ReportApprovalSetting.find_by(campaign_id: @user_report.campaign.id,
                                                       report_id: @user_report.report_id)

      approval_setting.approvers_can_edit?
    end
  end
end
