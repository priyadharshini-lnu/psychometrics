# frozen_string_literal: true

module Api
  class V2::Administration::ReportApprovalSettingsController < Api::V2::Administration::BaseController
    validates_request_schema :create, -> { Api::V2::ReportApprovalSetting::CreateContract.new }
    validates_request_schema :update, -> { Api::V2::ReportApprovalSetting::UpdateContract.new }

    validate_crud_requests Api::V2::ReportApprovalSetting::Schema

    def base_response_meta
      return {} if params[:action] != 'index'

      threesixty_campaign = if params.dig(:query, :is_threesixty)
                              Threesixty::Campaign.find_by(id: params[:campaign_id])
                            end
      {
        campaign_id: campaign.id,
        report_id: threesixty_campaign&.report_id
      }
    end
  end
end
