# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Dimensions::OccupationConditionSetsController, type: :controller do
  let(:superadmin) { create(:superadmin) }

  before { sign_in superadmin }

  describe 'GET #index' do
    let(:dimension1) { create(:dimension, occupations_enabled: true) }
    let(:dimension2) { create(:dimension, occupations_enabled: true) }
    let!(:ocs1) { dimension1.default_occupation_condition_set }
    let!(:ocs2) { dimension2.default_occupation_condition_set }

    it 'only returns condition sets belonging to the requested dimension' do
      get :index, params: { dimension_id: dimension1.id }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody
      returned_ids = json_response['data'].pluck('id')
      expect(returned_ids).to contain_exactly(ocs1.id.to_s)
      expect(returned_ids).not_to include(ocs2.id.to_s)
    end
  end

  describe 'POST #copy' do
    let(:dimension) { create(:dimension, occupations_enabled: true) }
    let!(:source) { dimension.default_occupation_condition_set }

    context 'when the new name is unique' do
      it 'creates a copy and returns it' do
        expect do
          post :copy,
               params: { dimension_id: dimension.id, id: source.id, data: { attributes: { new_name: 'Copied Set' } } }
        end.to change(OccupationConditionSet, :count).by(1)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody
        expect(json_response.dig('data', 'attributes', 'name')).to eq('Copied Set')
      end
    end

    context 'when the new name already exists in the dimension' do
      before { create(:occupation_condition_set, dimension: dimension, name: 'Existing') }

      it 'returns 422 without creating any records' do
        expect do
          post :copy,
               params: { dimension_id: dimension.id, id: source.id, data: { attributes: { new_name: 'Existing' } } }
        end.not_to change(OccupationConditionSet, :count)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
