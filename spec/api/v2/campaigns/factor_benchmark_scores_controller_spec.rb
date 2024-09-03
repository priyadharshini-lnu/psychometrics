# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::FactorBenchmarkScoresController, swagger_doc: 'v2/swagger.json',
type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:campaign_id) { threesixty_campaign.campaign.id }
  let!(:assessment_id) { threesixty_campaign.assessment.id }
  let!(:campaign_assessment) do
    create(:campaign_assessment, campaign: threesixty_campaign.campaign, assessment: threesixty_campaign.assessment)
  end
  let!(:factor) { create(:factor, dimension: threesixty_campaign.assessment.dimension) }
  let!(:factor2) { create(:factor, dimension: threesixty_campaign.assessment.dimension) }
  let!(:factor3) { create(:factor, dimension: threesixty_campaign.assessment.dimension) }
  let!(:factor_benchmark_score) do
    create(:factor_benchmark_score, campaign_id: campaign_id, assessment_id: assessment_id, factor_id: factor.id)
    create(:factor_benchmark_score, campaign_id: campaign_id, assessment_id: assessment_id, factor_id: factor3.id)
  end
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/factor_benchmark_scores/bulk_create' do
    post 'Factor Benchmark Scores bulk create/update' do
      operationId 'FactorBenchmarkScoresBulkCreate'
      description 'Factor Benchmark Scores Bulk Create'
      tags 'Factor Benchmark Scores'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/FactorBenchmarkScoreBulkCreateRequest' }, required: true

      response '200', 'Factor Benchmark Scores Bulk Create' do
        let(:'filter[user_id_eq]') { user.id }

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_values',
            attributes: {
              factor_id: 1,
              numeric_value: 3
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'factor_benchmark_scores',
              attributes: {
                factor.id => { operation: 'modify', value: 1.5 },
                factor2.id => { operation: 'add', value: 2.5 },
                factor3.id => { operation: 'delete', value: 3.5 }
              }
            }
          }
        end

        run_test! do |_|
          expect(FactorBenchmarkScore.count).to eq(2)
          expect(FactorBenchmarkScore.find_by(factor_id: factor.id).benchmark_score).to eq(1.5)
          expect(FactorBenchmarkScore.find_by(factor_id: factor2.id).benchmark_score).to eq(2.5)
          expect(FactorBenchmarkScore.find_by(factor_id: factor3.id)).to eq(nil)
        end
      end
    end
  end
end
