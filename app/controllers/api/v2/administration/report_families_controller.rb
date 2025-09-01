# frozen_string_literal: true

module Api
  class V2::Administration::ReportFamiliesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::ReportFamily::Schema

    private

    def resource
      @resource ||= Api::Administration::ReportFamilyPolicy::Scope.new(
        current_user, ReportFamily
      ).resolve.find(params[:report_family_id])
    end
  end
end
