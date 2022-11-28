# frozen_string_literal: true

module Api
  class V2::Administration::UserReportCommentsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::UserReportComment::Schema

    delegate :campaign_id, to: :user_report

    def user_report
      @user_report ||= Api::Administration::UserReportPolicy::Scope.new(
        current_user,
        UserReport
      ).resolve.find(params[:user_report_id])
    end

    def context
      super.merge(user_report: user_report)
    end
  end
end
