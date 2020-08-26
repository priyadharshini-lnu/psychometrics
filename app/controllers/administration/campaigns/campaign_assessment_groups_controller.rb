# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignAssessmentGroupsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update destroy]
      before_action :pundit_authorize

      def index
        render json: campaign,
         serializer: Administration::CampaignAssessmentGroups::WithUngroupedAssessmentsSerializer
      end

      def create
        group = campaign.campaign_assessment_groups.create(resource_params)
        render json: group, serializer: Administration::CampaignAssessmentGroups::GroupSerializer
      end

      def update
        resource.update(resource_params)
        render json: resource, serializer: Administration::CampaignAssessmentGroups::GroupSerializer
      end

      def destroy
        resource.delete
        render json: params[:id]
      end

      private

      def resource_params
        (params[:resource] || params[:campaign_assessment_group]).
          permit(:name, :previous_assessments_required, :previous_group_required)
      end

      def resource_class
        CampaignAssessmentGroup
      end
    end
  end
end
