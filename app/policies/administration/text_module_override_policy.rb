# frozen_string_literal: true

module Administration
  class TextModuleOverridePolicy < Administration::BasePolicy
    def initialize(_, _, data)
      super
      @user_report = UserReport.find(data[:user_report_id]) if data[:user_report_id]
    end

    def create?
      manage_qc?
    end

    def update?
      manage_qc?
    end

    def manage_qc?
      return true if @user.is?(:superadmin)

      ReportApprovalSetting.qcs(@user.id, @user_report.campaign.id).exists?(report_id: @user_report.report_id)
    end

    def approve?
      return true if @user.is?(:superadmin)

      ReportApprovalSetting.approvers(@user.id, @user_report.campaign.id).exists?(report_id: @user_report.report_id)
    end
  end
end
