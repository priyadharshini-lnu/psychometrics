# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class ReportsController < Api::V1::BaseController
        before_action :set_campaign, only: %i[update destroy]
        before_action :set_campaign_report, only: %i[update destroy]
        before_action :pundit_authorize

        def update
          @campaign_report.update!(campaign_report_params)
          audit! :api_update, @campaign_report, payload: params, campaign: @campaign_report.campaign
          render json: Api::V1::CampaignReportSerializer.new.serialize(@campaign_report)
        end

        def destroy
          @campaign_report.destroy!
          audit! :api_delete, @campaign_report, payload: @campaign_report.log_attributes,
                campaign: @campaign_report.campaign
          render json: Api::V1::CampaignReportSerializer.new.serialize(@campaign_report)
        end

        private

        def campaign_report_params
          params.permit(:user_access, :assessor_access)
        end

        def set_campaign_report
          @campaign_report = CampaignReport.find_by(campaign_id: @campaign.id, report_id: params[:id])
        end

        def set_campaign
          @campaign =
            begin
              c = Campaign.find_by(project_id: project.id, id: params[:campaign_id])
              raise Api::Errors::ResourceNotFound, "Campaign with id=#{params[:id]} is not found" unless c

              c
            end
        end

        def pundit_authorize
          authorize(
            @campaign_report || CampaignReport,
            nil,
            policy_class: ::Administration::CampaignReportPolicy,
            project_id: project.id
          )
        end
      end
    end
  end
end
