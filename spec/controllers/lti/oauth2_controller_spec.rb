# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::Oauth2Controller, type: :controller do
  let(:project) { create(:project) }
  let(:integration) { create(:integration, :yoodli, project: project) }
  let(:jwt_token) do
    JWT.encode({
      iss: project.id.to_s,
      aud: 'https://example.com/oauth2/token',
      exp: 1.hour.from_now.to_i,
      iat: Time.current.to_i,
      sub: project.id.to_s
    }, 'secret')
  end

  describe 'POST #token' do
    let(:valid_oauth2_params) do
      {
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt_token,
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score'
      }
    end

    let(:token_response) do
      {
        access_token: 'test_access_token_123',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score'
      }
    end

    context 'with valid OAuth2 request' do
      before do
        service_instance = instance_double(Lti::GenerateOauth2Token, call: { ok: token_response })
        allow(Lti::GenerateOauth2Token).to receive(:new).and_return(service_instance)
      end

      it 'returns successful token response' do
        post :token, params: valid_oauth2_params

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response['access_token']).to eq('test_access_token_123')
        expect(json_response['token_type']).to eq('Bearer')
        expect(json_response['expires_in']).to eq(3600)
        expect(json_response['scope']).to eq('https://purl.imsglobal.org/spec/lti-ags/scope/score')
      end

      it 'calls GenerateOauth2Token service' do
        service_instance = instance_double(Lti::GenerateOauth2Token)
        expect(Lti::GenerateOauth2Token).to receive(:new).and_return(service_instance)
        expect(service_instance).to receive(:call).and_return({ ok: token_response })

        post :token, params: valid_oauth2_params
      end
    end

    context 'with invalid OAuth2 request (service returns error)' do
      let(:error_response) do
        {
          'error' => 'invalid_client',
          'error_description' => 'Invalid client assertion'
        }
      end

      before do
        service_instance = instance_double(Lti::GenerateOauth2Token, call: { error: error_response })
        allow(Lti::GenerateOauth2Token).to receive(:new).and_return(service_instance)
      end

      it 'returns bad request with error details' do
        post :token, params: valid_oauth2_params

        expect(response).to have_http_status(:bad_request)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response['error']).to eq('invalid_client')
        expect(json_response['error_description']).to eq('Invalid client assertion')
      end
    end

    context 'when service raises an exception' do
      let(:error_message) { 'Database connection failed' }

      before do
        allow(Lti::GenerateOauth2Token).to receive(:new).and_raise(StandardError, error_message)
      end

      it 'returns internal server error' do
        post :token, params: valid_oauth2_params

        expect(response).to have_http_status(:internal_server_error)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response['error']).to eq('server_error')
        expect(json_response['error_description']).to eq(error_message)
      end
    end
  end
end
