# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::OidcController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:assessment) { create(:assessment, :yoodli) }
  let(:user_assessment) do
    create(:user_assessment,
           evaluator: user,
           subject: user,
           assessment: assessment)
  end
  let(:campaign) { user_assessment.campaign }
  let(:integration) { create(:integration, :yoodli, project: user_assessment.project) }

  before do
    login_user(user)
  end

  after { sign_out(user) }

  describe 'POST #auth' do
    let(:valid_oidc_params) do
      {
        response_type: 'id_token',
        scope: 'openid',
        login_hint: user_assessment.encoded_id,
        lti_message_hint: 'test-message-hint',
        state: 'test-state',
        redirect_uri: 'https://yoodli.example.com/redirect',
        client_id: user_assessment.project.id.to_s,
        lti_deployment_id: integration.id.to_s,
        nonce: 'test-nonce-12345678'
      }
    end

    context 'with valid parameters' do
      let(:form_result) { { redirect_uri: 'https://yoodli.example.com/redirect', id_token: 'test-jwt-token', state: 'test-state' } }

      before do
        allow(Lti::ProcessOidcAuth).to receive(:call).and_return({ ok: form_result })
        allow(controller).to receive(:render).and_return(true)
      end

      it 'processes valid OIDC authentication' do
        post :auth, params: valid_oidc_params

        expect(response).to have_http_status(:no_content)
      end

      it 'calls ProcessOidcAuth service' do
        expect(Lti::ProcessOidcAuth).to receive(:call).and_return({ ok: form_result })

        post :auth, params: valid_oidc_params
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        valid_oidc_params.except(:client_id, :redirect_uri)
      end

      it 'returns bad request with error message' do
        post :auth, params: invalid_params

        expect(response).to have_http_status(:bad_request)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response).to have_key('error')
        expect(json_response['error']).to be_present
      end

      it 'does not call ProcessOidcAuth service' do
        expect(Lti::ProcessOidcAuth).not_to receive(:call)

        post :auth, params: invalid_params
      end
    end

    context 'when ProcessOidcAuth service fails' do
      let(:error_message) { 'OIDC authentication failed' }

      before do
        allow(Lti::ProcessOidcAuth).to receive(:call).and_return({ error: error_message })
      end

      it 'returns bad request with error message' do
        post :auth, params: valid_oidc_params

        expect(response).to have_http_status(:bad_request)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response).to have_key('error')
        expect(json_response['error']).to eq(error_message)
      end

      it 'logs the error' do
        expect(Rails.logger).to receive(:error).with("OIDC Auth Error: #{error_message}")

        post :auth, params: valid_oidc_params
      end
    end
  end

  describe 'GET #redirect' do
    it 'redirects when user assessment exists' do
      get :redirect, params: { id: user_assessment.id }

      expect(response).to have_http_status(:redirect)
    end
  end
end
