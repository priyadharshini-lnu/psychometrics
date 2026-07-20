# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignAssessmentsController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[update update_external_config update_occupation_condition_set]
      before_action :pundit_authorize

      def update
        resource.update(resource_params)
        audit! :update, resource, payload: resource_params, campaign: resource.campaign
        render json: Administration::CampaignAssessmentGroups::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user
          }
        ).serialize(resource)
      end

      def update_positions
        campaign_assessments = update_position_params[:campaign_assessments]
        ::CampaignAssessments::UpdatePositions.call(campaign, campaign_assessments) do
          on(:ok) do
            render json: Administration::CampaignAssessmentGroups::GroupsAndAssessmentsSerializer.new(
              context: {
                current_user: current_user
              }
            ).serialize(campaign)
          end
          on(:error) { |errors| return render json: { errors: errors }, status: 400 }
        end
      end

      def update_external_config
        resource.update(external_config: params.dig(:campaign_assessment, :external_config))
        if resource.valid?
          audit! :update, resource, payload: resource_params, campaign: resource.campaign
          render json: Administration::CampaignAssessmentSerializer.new(
            context: {
              current_user: current_user,
              project_id: campaign.project_id,
              campaign_id: campaign.id
            }
          ).serialize(resource)
        else
          render json: { errors: resource.errors.messages }, status: 422
        end
      end

      def update_occupation_condition_set
        condition_set_id = params.dig(:campaign_assessment, :occupation_condition_set_id)
        apply_to_existing = ActiveRecord::Type::Boolean.new.cast(params[:apply_to_existing_users])

        ::CampaignAssessments::UpdateOccupationConditionSet.call(resource, condition_set_id, apply_to_existing) do
          on(:ok) do |updated_resource|
            audit!(
              :update,
              updated_resource,
              payload: {
                occupation_condition_set_id: condition_set_id,
                apply_to_existing_users: apply_to_existing
              },
              campaign: updated_resource.campaign
            )

            render json: Administration::CampaignAssessmentSerializer.new(
              context: {
                current_user: current_user,
                project_id: campaign.project_id,
                campaign_id: campaign.id
              }
            ).serialize(updated_resource)
          end
        end
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: project.id,
          campaign_id: campaign.id
        )
      end

      def update_position_params
        params.permit(campaign_assessments: [%i[id position campaign_assessment_group_id workshop_activity_duration]])
      end

      def resource_params
        (params[:resource] || params[:campaign_assessment]).permit(
          :position, :campaign_assessment_group_id, :proctoring_enabled
        )
      end

      def resource_class
        CampaignAssessment
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.campaign_assessments.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end
