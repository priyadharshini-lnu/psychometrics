# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::Ags::ScoresController, type: :controller do
  let(:user_assessment) { create(:user_assessment) }
  let(:line_item_id) { user_assessment.encoded_id }

  describe 'GET #show' do
    it 'returns ok status' do
      get :show, params: { line_item_id: line_item_id }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST #create' do
    let(:valid_score_data) do
      {
        userId: user_assessment.evaluator.id.to_s,
        scoreGiven: 85,
        scoreMaximum: 100
      }
    end

    before do
      request.headers['Authorization'] = 'Bearer valid_access_token'
      request.headers['Content-Type'] = 'application/json'
      allow(Lti::Ags::ProcessScoreSubmission).to receive(:call).and_return({ success: true })
    end

    it 'returns ok status' do
      post :create, params: { line_item_id: line_item_id }, body: valid_score_data.to_json

      expect(response).to have_http_status(:ok)
    end

    it 'calls ProcessScoreSubmission service' do
      expect(Lti::Ags::ProcessScoreSubmission).to receive(:call).and_return({ success: true })

      post :create, params: { line_item_id: line_item_id }, body: valid_score_data.to_json
    end
  end
end
