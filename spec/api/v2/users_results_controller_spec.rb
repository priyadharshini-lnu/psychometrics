# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::UsersResultsController, swagger_doc: 'v2/swagger.json', type: :request do
  describe 'GET show' do
    let!(:superadmin) { create(:superadmin) }
    let(:user_assessment) { create(:user_assessment) }
    let!(:users_result) do
      create(:users_result,
             user_assessment: user_assessment,
                answers: { '1' => { 'answers' => [{ 'value' => true }] } },
                scoring: { 'total' => 10 },
                external_results: { 'status' => 'completed' })
    end

    before { sign_in(superadmin) }

    it 'returns users result data' do
      get "/api/v2/administration/users_results/#{users_result.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['data']['attributes']).to include(
        'answers' => users_result.answers,
        'scoring' => users_result.scoring,
        'external_results' => users_result.external_results
      )
    end
  end
end
