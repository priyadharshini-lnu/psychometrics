# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::MicrositeController, type: :controller do
  let(:project) { create(:project, subdomain: 'test-project') }
  let(:user) { create(:user, email: 'test@example.com', password: 'Th3P@sword1!') }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :microsite, project: project) }
  let(:user_assessment) do
    create(:user_assessment, subject: user, campaign: campaign, assessment: assessment, project: project)
  end
  let(:microsite_user_assessment) do
    create(:microsite_user_assessment, user_assessment: user_assessment, participant_id: 'participant-123')
  end
  let(:api_key) { 'test-api-key-secret' }
  let(:jwt_payload) do
    { 'participant_id' => microsite_user_assessment.participant_id, 'email' => user.email,
      'password' => 'Th3P@sword1!' }
  end
  let(:token) { JWT.encode(jwt_payload, api_key, 'HS256') }

  before do
    allow_any_instance_of(described_class).to receive(:project).and_return(project)
    allow_any_instance_of(described_class).to receive(:api_key).and_return(api_key)
  end

  describe 'POST #auth' do
    context 'with valid credentials' do
      it 'returns success' do
        post :auth, params: { token: token }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq({ 'success' => true })
      end
    end

    context 'with invalid JWT token' do
      it 'returns unauthorized' do
        post :auth, params: { token: 'invalid-token' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with missing token' do
      it 'returns unauthorized' do
        post :auth, params: {}

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with wrong email in payload' do
      let(:jwt_payload) do
        { 'participant_id' => microsite_user_assessment.participant_id, 'email' => 'wrong@example.com',
          'password' => 'Th3P@sword1!' }
      end

      it 'returns unauthorized' do
        post :auth, params: { token: token }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with wrong password in payload' do
      let(:jwt_payload) do
        { 'participant_id' => microsite_user_assessment.participant_id, 'email' => user.email,
          'password' => 'wrongpassword' }
      end

      it 'returns unauthorized with error message' do
        post :auth, params: { token: token }

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body).to eq({ 'success' => false, 'error' => 'Invalid credentials' })
      end
    end

    context 'with disabled user' do
      before { user.update!(disabled: true) }

      it 'returns unauthorized with disabled account error' do
        post :auth, params: { token: token }

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body).to eq({ 'success' => false, 'error' => 'Account is disabled' })
      end
    end
  end

  describe 'POST #results' do
    let(:responses) do
      [
        { 'questionId' => 'q1', 'result' => { 'kind' => 'single_choice', 'selected' => 'a' } }
      ]
    end
    let(:completed_at) { '2026-05-13T10:00:00Z' }
    let(:results_payload) do
      { 'participant_id' => microsite_user_assessment.participant_id, 'responses' => responses,
        'completedAt' => completed_at }
    end
    let(:results_token) { JWT.encode(results_payload, api_key, 'HS256') }

    context 'with valid JWT and responses' do
      before do
        allow(Microsite::SaveAnswers).to receive(:call!)
      end

      it 'returns success' do
        post :results, params: { token: results_token }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq({ 'success' => true })
      end
    end

    context 'with invalid JWT token' do
      it 'returns unauthorized' do
        post :results, params: { token: 'invalid-token' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with missing JWT token' do
      it 'returns unauthorized' do
        post :results, params: {}

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with non-existent participant' do
      let(:results_payload) do
        { 'participant_id' => 'non-existent', 'responses' => responses, 'completedAt' => completed_at }
      end

      it 'returns not found' do
        post :results, params: { token: results_token }

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
