# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::FactorsNormsController, type: :request do
  let(:superadmin) { create(:superadmin) }
  let!(:factors_norm) { create(:factors_norm) }

  before(:each) { sign_in(superadmin) }

  describe 'POST /api/v2/factors_norms/update_cell' do
    it 'updates a cell in factors norm' do
      body = {
        data: {
          type: 'factors_norms',
          attributes: {
            norm_id: factors_norm.norm_id,
            factor_id: factors_norm.factor_id,
            level: 'Low',
            field_name: 'score_from',
            field_value: '1.0'
          }
        }
      }

      post '/api/v2/administration/factors_norms/update_cell',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      factors_norm_response = JSON.parse(response.body)
      expect(factors_norm_response['data']).to have_key('id')
      expect(factors_norm_response['data']['attributes']['norm_id']).to eq(factors_norm.norm_id)
      expect(factors_norm_response['data']['attributes']['props']).to include(
        include('level' => 'Low', 'score_from' => '1.0')
      )
    end

    it 'returns error for invalid params' do
      body = {
        data: {
          type: 'factors_norms',
          attributes: {
            norm_id: factors_norm.norm_id,
            factor_id: factors_norm.factor_id,
            level: 'Low',
            field_name: 'score_from',
            field_value: 'invalid_float'
          }
        }
      }

      post '/api/v2/administration/factors_norms/update_cell',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      error_response = JSON.parse(response.body)
      expect(
        error_response['errors'][0]['title']
      ).to include(I18n.t('dry_errors.errors.factors_norms.invalid_float'))
    end
  end
end
