# frozen_string_literal: true

module ReportApprovals
  class ReportApprovalMetadataFetcher < BaseCommand
    def initialize(current_user)
      @current_user = current_user
    end

    def call
      broadcast :ok, {
        campaigns: campaigns_data,
        reports: reports_data,
        qc_users: qc_users_data,
        approvers: approvers_data
      }
    end

    private

    def campaigns_data
      campaigns.map { |campaign| slice_campaign_data(campaign) }
    end

    def reports_data
      reports.map { |report| slice_report_data(report) }
    end

    def qc_users_data
      qc_users.map { |user| slice_user_data(user) }
    end

    def approvers_data
      approvers.map { |user| slice_user_data(user) }
    end

    def campaigns
      Campaign.joins(:report_approvals).merge(report_approvals).distinct
    end

    def reports
      Report.joins(:report_approvals).merge(report_approvals).distinct
    end

    def qc_users
      User.where(id: report_approvals.pluck(:qc_user_id).flatten.uniq.compact)
    end

    def approvers
      User.where(id: report_approvals.pluck(:approver_user_id).flatten.uniq.compact)
    end

    def report_approvals
      @report_approvals ||= ::ReportApprovalSetting.report_approvals(current_user)
    end

    def slice_campaign_data(campaign)
      campaign.slice(:id, :name)
    end

    def slice_report_data(report)
      report.slice(:id, :name)
    end

    def slice_user_data(user)
      user.slice(:id).merge(name: user.decorate.display_name)
    end

    attr_reader :current_user
  end
end
