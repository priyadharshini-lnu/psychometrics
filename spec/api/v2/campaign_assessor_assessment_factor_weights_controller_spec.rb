# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignAssessorAssessmentFactorWeightsController, swagger_doc: 'v2/swagger.json',
  type: :request do
  let!(:campaign_assessor_assessment_factor_weight) { create(:campaign_assessor_assessment_factor_weight) }
  let!(:campaign_id) { campaign_assessor_assessment_factor_weight.campaign_id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_assessor_assessment_factor_weights/' do
    get 'Campaign Assessor Assessment Factor Weight List' do
      operationId 'CampaignAssessorAssessmentFactorWeightList'
      description 'Fetch Campaigns Assessor Assessment Factor Weights list'

      tags 'Campaign Assessor Assessment Factor Weight'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaigns Assessor Assessment Factor Weight list' do
        schema '$ref' => '#/components/schemas/CampaignAssessorAssessmentFactorWeightListResponse'

        examples 'application/json' => [{
          type: 'campaign_assessor_assessment_factor_weight',
          data: {
            id: '1',
            attributes: {
              weight: 0.5
            },
            relationships: {
              assessment: { data: { type: 'assessments', id: '101' } },
              factor: { data: { type: 'factors', id: '10' } }
            }
          }
        }]

        run_test! do |response|
          response = JSON.parse(response.body)
          factor_weight_response = response['data'].find do |c|
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
    end
  end

  path '/campaigns/{campaign_id}/campaign_assessor_assessment_factor_weights/bulk_upsert' do
    post 'Campaign Assessor Assessment Factor Weight Bulk Upsert' do
      operationId 'CampaignAssessorAssessmentFactorWeightBulkUpsert'
      description 'Fetch Campaigns Assessor Assessment Factor Weights Bulk Upsert'

      tags 'Campaign Assessor Assessment Factor Weight'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/CampaignAssessorAssessmentFactorWeightBulkUpsertRequest' },
                required: true

      response '200', 'Campaigns Assessor Assessment Factor Weight Bulk Upsert' do
        schema '$ref' => '#/components/schemas/OKResponse'

        # examples 'application/json' => 'ok'

        let(:assessment) { create(:assessment) }
        let(:factor) { create(:factor) }
        let(:body) do
          {
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
        end

        run_test! do
          expect(campaign_assessor_assessment_factor_weight.reload.weight).to eq(0.92)
          new_factor_weight = CampaignAssessorAssessmentFactorWeight.find_by(
            factor: factor, assessment: assessment, campaign: campaign_assessor_assessment_factor_weight.campaign
          )
          expect(new_factor_weight.weight).to eq(1.0)
        end
      end
    end
  end
end
