# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class AssessmentsController < ::Api::V1::BaseController
        before_action :set_campaign, only: %i[update destroy]
        before_action :set_campaign_assessment, only: %i[update destroy]
        before_action :pundit_authorize

        def update
          @campaign_assessment.update!(campaign_assessment_params)
          audit! :api_update, @campaign_assessment, payload: params, campaign: @campaign_assessment.campaign
          render json: @campaign_assessment, serializer: ::Api::V1::CampaignAssessmentSerializer
        end

        def destroy
          @campaign_assessment.destroy!
          audit! :api_delete, @campaign_assessment, payload: @campaign_assessment.log_attributes,
                campaign: @campaign_assessment.campaign
          render json: @campaign_assessment, serializer: ::Api::V1::CampaignAssessmentSerializer
        end

        private

        def campaign_assessment_params
          params.permit(:norm_id)
        end

        def set_campaign_assessment
          @campaign_assessment = CampaignAssessment.find_by(campaign_id: @campaign.id,
                                                            assessment_id: params[:id])
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
            @campaign_assessment || CampaignAssessment,
            nil,
            policy_class: ::Administration::CampaignAssessmentPolicy,
            project_id: project.id
          )
        end
      end
    end
  end
end
