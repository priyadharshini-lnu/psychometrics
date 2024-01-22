# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::DimensionsController < Api::V2::Administration::BaseController
    def assessor_dimensions
      dimensions = ::Api::Administration::Campaigns::DimensionPolicy::Scope.new(
        current_user, ::Dimension,
        campaign_id: campaign_id
      ).resolve(CampaignAssessorAssessment.where(campaign_id: campaign_id).select(:assessment_id)).
                   ransack(params[:filter]).result.select(:id, :name)

      jsonapi_render json: dimensions.to_a, options: { resource: Api::V2::Administration::DimensionResource }
    end

    def factors
      assessment_ids = CampaignAssessorAssessment.where(campaign_id: campaign_id).pluck(:assessment_id) +
                       CampaignAssessment.where(campaign_id: campaign_id).pluck(:assessment_id)

      factors = ::Api::Administration::Campaigns::DimensionPolicy::Scope.new(
        current_user, ::Dimension,
        campaign_id: campaign_id
      ).resolve(assessment_ids).find(params[:id]).factors.ransack(params[:filter]).result

      jsonapi_render json: factors.to_a, options: { resource: Api::V2::Administration::FactorResource }
    end
  end
end
