# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Dimensions::FactorsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:dimension) { create(:dimension) }

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/dimensions/:dimension_id/factors' do
    let!(:questions_factor) { create(:factor, dimension: dimension, scoring_strategy: 'questions') }
    let!(:sum_factor) { create(:factor, dimension: dimension, scoring_strategy: 'sub_factors_sum') }

    it 'filters factors by scoring strategy' do
      get "/api/v2/administration/dimensions/#{dimension.id}/factors",
          params: { filter: { scoring_strategy_in: 'sub_factors_sum' } },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok), response.body

      parsed_response = JSON.parse(response.body)
      factor_ids = parsed_response['data'].pluck('id')

      expect(factor_ids).to include(sum_factor.id.to_s)
      expect(factor_ids).not_to include(questions_factor.id.to_s)
    end
  end

  describe 'POST /api/v2/administration/dimensions/:dimension_id/factors' do
    let(:body) do
      {
        data: {
          type: 'factors',
          attributes: {
            name: 'test',
            code: 'tes',
            scoring_strategy: 'sub_factors_sum',
            precision: 1,
            use_sub_factor_norm_score: true,
            score_min: 1,
            score_max: 3,
            child_factor_type: 'regular',
            factors_sub_factors: []
          },
          relationships: {
            dimension: {
              data: {
                type: 'dimensions',
                id: dimension.id.to_s
              }
            }
          }
        }
      }
    end

    it 'creates a factor with sub-factor payload attributes' do
      existing_count = Factor.count

      post "/api/v2/administration/dimensions/#{dimension.id}/factors",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created), response.body
      expect(Factor.count).to eq(existing_count + 1)

      factor_response = JSON.parse(response.body)['data']
      created_factor = Factor.find(factor_response['id'])

      expect(factor_response).to have_attribute(:name).with_value('test')
      expect(factor_response).to have_attribute(:code).with_value('tes')
      expect(factor_response).to have_attribute(:scoring_strategy).with_value('sub_factors_sum')
      expect(factor_response).to have_attribute(:use_sub_factor_norm_score).with_value(true)

      expect(created_factor.score_min).to eq(1)
      expect(created_factor.score_max).to eq(3)
      expect(created_factor.child_factor_type).to eq('regular')
      expect(created_factor.dimension_id).to eq(dimension.id)
    end
  end
end
