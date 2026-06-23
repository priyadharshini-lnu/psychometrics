# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::FactorBenchmarkScoresController, type: :request do
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
  before { sign_in(superadmin) }

  describe 'POST /api/v2/administration/campaigns/{campaign_id}/factor_benchmark_scores/bulk_create' do
    it 'bulk creates/updates factor benchmark scores' do
      body = {
        data: {
          type: 'factor_benchmark_scores',
          attributes: {
            factor.id => { operation: 'modify', value: 1.5 },
            factor2.id => { operation: 'add', value: 2.5 },
            factor3.id => { operation: 'delete', value: 3.5 }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/factor_benchmark_scores/bulk_create", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(200)
      expect(FactorBenchmarkScore.count).to eq(2)
      expect(FactorBenchmarkScore.find_by(factor_id: factor.id).benchmark_score).to eq(1.5)
      expect(FactorBenchmarkScore.find_by(factor_id: factor2.id).benchmark_score).to eq(2.5)
      expect(FactorBenchmarkScore.find_by(factor_id: factor3.id)).to eq(nil)
    end
  end
end
