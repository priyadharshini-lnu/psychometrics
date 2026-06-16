# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignAssessorAssessmentFactorWeightsController,
               type: :request do
  let!(:campaign_assessor_assessment_factor_weight) { create(:campaign_assessor_assessment_factor_weight) }
  let!(:campaign_id) { campaign_assessor_assessment_factor_weight.campaign_id }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_assessor_assessment_factor_weights' do
    it 'fetches campaign assessor assessment factor weights list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_assessor_assessment_factor_weights"

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)
      factor_weight_response = response_data['data'].find do |c|
        c['id'] == campaign_assessor_assessment_factor_weight.id.to_s
      end
      expect(factor_weight_response).to have_attribute(:weight).
        with_value(
          campaign_assessor_assessment_factor_weight.weight
        )
      expect(factor_weight_response).to have_relationship(:assessment)
      expect(factor_weight_response).to have_relationship(:factor)
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/' \
           'campaign_assessor_assessment_factor_weights/bulk_upsert' do
    it 'bulk upserts campaign assessor assessment factor weights' do
      assessment = create(:assessment)
      factor = create(:factor)
      body = {
        data: {
          type: 'campaign_assessor_assessment_factor_weight',
          attributes: {
            data: [
              {
                factor_id: campaign_assessor_assessment_factor_weight.factor_id.to_s,
                assessment_id: campaign_assessor_assessment_factor_weight.assessment_id.to_s,
                weight: 0.92
              },
              {
                factor_id: factor.id.to_s,
                assessment_id: assessment.id.to_s,
                weight: 1
              }
            ]
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_assessor_assessment_factor_weights/bulk_upsert",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(campaign_assessor_assessment_factor_weight.reload.weight).to eq(0.92)
      new_factor_weight = CampaignAssessorAssessmentFactorWeight.find_by(
        factor: factor, assessment: assessment, campaign: campaign_assessor_assessment_factor_weight.campaign
      )
      expect(new_factor_weight.weight).to eq(1.0)
    end
  end
end
