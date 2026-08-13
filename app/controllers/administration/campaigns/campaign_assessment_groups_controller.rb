# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignAssessmentGroupsController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[update destroy fetch_name_translations]
      before_action :pundit_authorize

      def index
        render json: Administration::CampaignAssessmentGroups::GroupsAndAssessmentsSerializer.new(
          context: {
            current_user: current_user
          }
        ).serialize(campaign)
      end

      def create
        group = with_requested_locale { campaign.campaign_assessment_groups.create(resource_params) }
        audit! :create, campaign, payload: resource_params, campaign: campaign
        render json: Administration::CampaignAssessmentGroups::GroupSerializer.new.serialize(group)
      end

      def fetch_name_translations
        locales = params[:locales] || []
        list = locales.map do |locale|
          Mobility.with_locale(locale) do
            {
              name: resource.name,
              locale: locale
            }
          end
        end

        render json: { list: list, available_locales: resource.translations.pluck(:locale) }
      end

      def update
        audit! :update, campaign, payload: resource_params, campaign: campaign
        with_requested_locale { resource.update(resource_params) }
        render json: Administration::CampaignAssessmentGroups::GroupSerializer.new.serialize(resource)
      end

      def destroy
        ::CampaignAssessmentGroups::Destroy.call!(campaign, resource) do
          on(:ok) do
            audit! :delete, campaign, campaign: campaign, payload: resource.log_attribute_for_delete
            render json: params[:id]
          end
          on(:error) { |errors| return render json: { errors: errors }, status: 400 }
        end
      end

      def update_positions
        groups = update_position_params[:campaign_assessment_groups]
        ::CampaignAssessmentGroups::UpdatePositions.call(campaign, groups) do
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

      private

      def update_position_params
        params.permit(campaign_assessment_groups: [%i[id position]])
      end

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def resource_params
        (params[:resource] || params[:campaign_assessment_group]).
          permit(:name, :previous_assessments_required, :previous_group_required,
                 :require_previous_groups_completion_for_booking, :position, :group_type)
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.campaign_assessment_groups.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName

      def resource_class
        CampaignAssessmentGroup
      end

      def with_requested_locale(&)
        locale = params[:locale].presence || I18n.default_locale
        Mobility.with_locale(locale, &)
      end
    end
  end
end
