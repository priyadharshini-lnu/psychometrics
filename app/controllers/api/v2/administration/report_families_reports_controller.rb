# frozen_string_literal: true

module Api
  class V2::Administration::ReportFamiliesReportsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validates_request_schema :create, -> { Api::V2::ReportFamiliesReport::Contract.new }
    validates_request_schema :update, -> { Api::V2::ReportFamiliesReport::Contract.new }
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
