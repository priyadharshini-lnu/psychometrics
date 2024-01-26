# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentFactorWeightsController < Api::V2::Administration::BaseController
    validates_request_schema :bulk_upsert, Api::V2::CampaignAssessorAssessmentFactorWeight::Schema.bulk_upsert

    def bulk_upsert
      audit! :bulk_upsert, nil, record_type: CampaignAssessorAssessmentFactorWeight,
        payload: params[:data][:attributes], campaign: campaign

      CampaignAssessorAssessmentFactorWeight.transaction do
        params[:data][:attributes][:data].each do |record|
          factor_weight = campaign.campaign_assessor_assessment_factor_weights.find_or_initialize_by(
            assessment_id: record[:assessment_id], factor_id: record[:factor_id]
          )
          factor_weight.weight = record[:weight]
          factor_weight.save!
        end
      end

      render json: :ok
    end
  end
end
