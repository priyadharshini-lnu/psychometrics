# frozen_string_literal: true

module Api::V2::Administration::Threesixty
  class Threesixty::ReportApprovalSettingsController < Api::V2::Administration::BaseController
    validates_request_schema :create, Api::V2::ReportApprovalSetting::CreateContract.new
    validates_request_schema :update, Api::V2::ReportApprovalSetting::UpdateContract.new

    validate_crud_requests Api::V2::ReportApprovalSetting::Schema
  end
end
