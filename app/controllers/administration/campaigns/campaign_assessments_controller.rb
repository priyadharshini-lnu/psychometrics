# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignAssessmentsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update update_external_config]
      before_action :pundit_authorize

      def update
        resource.update(resource_params)
        audit! :update, resource, payload: resource_params, campaign: resource.campaign
        render json: resource,
         serializer: Administration::CampaignAssessmentGroups::CampaignAssessmentSerializer,
         current_user: current_user
      end

      def update_positions
        campaign_assessments = update_position_params[:campaign_assessments]
        ::CampaignAssessments::UpdatePositions.call(campaign, campaign_assessments) do
          on(:ok) do
            render json: campaign,
            serializer: Administration::CampaignAssessmentGroups::GroupsAndAssessmentsSerializer
          end
          on(:error) { |errors| return render json: { errors: errors }, status: 400 }
        end
      end

      def update_external_config
        resource.update(external_config: params.dig(:campaign_assessment, :external_config))
        if resource.valid?
          audit! :update, resource, payload: resource_params, campaign: resource.campaign
          render json: resource, serializer: Administration::CampaignAssessmentSerializer
        else
          render json: { errors: resource.errors.messages }, status: 422
        end
      end

      private

      def update_position_params
        params.permit(campaign_assessments: [%i[id position campaign_assessment_group_id]])
      end

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
