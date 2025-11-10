# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::JwksController, type: :controller do
  describe 'GET #index' do
    let(:jwks_data) do
      {
        'keys' => [
          {
            'kty' => 'RSA',
            'kid' => 'a1b2c3d4e5f6g7h8i9j0k1',
            'n' => 'sample_n_value',
            'e' => 'AQAB',
            'use' => 'sig',
            'alg' => 'RS256'
          }
        ]
      }
    end

    context 'when JWKS generation is successful' do
      before do
        allow(Lti::GenerateJwks).to receive(:call!).and_return(jwks_data)
      end

      it 'returns JWKS with the public key' do
        get :index

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response).to have_key('keys')
        expect(json_response['keys']).to be_an(Array)
        expect(json_response['keys'].length).to eq(1)

        key = json_response['keys'].first
        expect(key['kty']).to eq('RSA')
        expect(key['kid']).to eq('a1b2c3d4e5f6g7h8i9j0k1')
        expect(key['use']).to eq('sig')
        expect(key['alg']).to eq('RS256')
        expect(key).to have_key('n')
        expect(key).to have_key('e')
      end
    end

    context 'when JWKS generation fails' do
      let(:error_message) { 'LTI private key not configured' }

      before do
        allow(Lti::GenerateJwks).to receive(:call!).and_raise(StandardError, error_message)
      end

      it 'returns an error response' do
        get :index

        expect(response).to have_http_status(:internal_server_error)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response).to have_key('error')
        expect(json_response['error']).to eq(error_message)
      end
    end
  end
end
