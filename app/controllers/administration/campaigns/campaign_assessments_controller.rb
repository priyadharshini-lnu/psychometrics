# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignAssessmentsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update attach_to_group]
      before_action :pundit_authorize

      def update
        resource.update(resource_params)
        render json: resource,
         serializer: Administration::CampaignAssessmentGroups::CampaignAssessmentSerializer
      end

      def attach_to_group
        ::CampaignAssessments::AttachToGroup.call!(resource, params[:group_id], params[:position])

        render json: :ok
      end

      private

      def resource_params
        (params[:resource] || params[:campaign_assessment]).permit(:position, :campaign_assessment_group_id)
      end

      def resource_class
        CampaignAssessment
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:id])
      end
    end
  end
end
