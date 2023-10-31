# frozen_string_literal: true

module Api
  class V2::Administration::ReportFamiliesReportsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::ReportFamiliesReport::Schema

    private

    def context
      super.merge(report_family: report_family)
    end

    def report_family
      @report_family ||= Api::Administration::ReportFamilyPolicy::Scope.new(
        current_user, ReportFamily
      ).resolve.find(params[:report_family_id])
    end
  end
end
