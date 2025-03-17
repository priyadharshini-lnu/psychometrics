# frozen_string_literal: true

module Api
  class V2::Administration::ReportApprovalsController < Api::V2::Administration::BaseController
    def search_campaign
      campaings = Campaign.joins(:report_approvals).merge(
        ::ReportApprovalSetting.report_approvals(current_user)
      ).distinct.limit(10).ransack(params[:filter]).result

      render json: campaings.map { |c| c.slice(:id, :name) }
    end

    def search_report
      reports = Report.joins(:report_approvals).merge(
        ::ReportApprovalSetting.report_approvals(current_user)
      ).distinct.limit(10).ransack(params[:filter]).result

      render json: reports.map { |r| r.slice(:id, :name) }
    end

    def search_user
      users = User.joins(:report_approvals).merge(
        ::ReportApprovalSetting.report_approvals(current_user)
      ).distinct.limit(10).ransack(params[:filter]).result

      render json: users.map { |u| u.slice(:id, :email).merge(name: u.decorate.display_name) }
    end

    def metadata_for_filters
      response = ReportApprovals::ReportApprovalMetadataFetcher.call!(current_user, filter: params[:filter])

      render json: response
    end
  end
end
