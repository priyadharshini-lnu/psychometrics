# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::FetchJwtPublicKey do
  let(:kid) { 'test_key_id' }
  let(:integration) { double('integration') }
  let(:jwks_url) { 'https://example.com/.well-known/jwks.json' }
  let(:valid_jwks) do
    {
      'keys' => [
        {
          'kty' => 'RSA',
          'kid' => kid,
          'use' => 'sig',
          'alg' => 'RS256',
          'n' => 'test_n_value',
          'e' => 'AQAB'
        }
      ]
    }
  end

  subject { described_class.new(kid, integration) }

  before do
    allow(integration).to receive(:lti_config).and_return({ 'keyset_url' => jwks_url })
  end

  describe '#call' do
    context 'with successful JWKS fetch' do
      let(:response) { instance_double(Faraday::Response, success?: true, body: valid_jwks) }

      before do
        conn = instance_double(Faraday::Connection)
        allow(Faraday).to receive(:new).and_return(conn)
        allow(conn).to receive(:get).with(jwks_url).and_return(response)
        allow(JWT::JWK).to receive(:import).and_return(double('jwk', public_key: 'public_key'))
      end

      it 'broadcasts ok event with public key' do
        expect { subject.call }.to broadcast(:ok, 'public_key')
      end
    end

    context 'with HTTP error' do
      let(:response) { instance_double(Faraday::Response, success?: false, status: 404) }

      before do
        conn = instance_double(Faraday::Connection)
        allow(Faraday).to receive(:new).and_return(conn)
        allow(conn).to receive(:get).with(jwks_url).and_return(response)
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, 'Failed to fetch JWKS: HTTP 404')
      end
    end

    context 'with network error' do
      before do
        conn = instance_double(Faraday::Connection)
        allow(Faraday).to receive(:new).and_return(conn)
        allow(conn).to receive(:get).and_raise(Faraday::Error.new('Network error'))
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, 'Network error fetching JWKS: Network error')
      end
    end

    context 'with missing key in JWKS' do
      let(:jwks_without_key) do
        {
          'keys' => [
            {
              'kty' => 'RSA',
              'kid' => 'different_key_id',
              'use' => 'sig',
              'alg' => 'RS256',
              'n' => 'test_n_value',
              'e' => 'AQAB'
            }
          ]
        }
      end
      let(:response) { instance_double(Faraday::Response, success?: true, body: jwks_without_key) }

      before do
        conn = instance_double(Faraday::Connection)
        allow(Faraday).to receive(:new).and_return(conn)
        allow(conn).to receive(:get).with(jwks_url).and_return(response)
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, 'No matching key found in JWK set')
      end
    end

    context 'with invalid JSON response' do
      let(:invalid_response) { instance_double(Faraday::Response, success?: true, body: { 'invalid' => 'structure' }) }

      before do
        conn = instance_double(Faraday::Connection)
        allow(Faraday).to receive(:new).and_return(conn)
        allow(conn).to receive(:get).with(jwks_url).and_return(invalid_response)
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, 'Invalid JWKS format')
      end
    end
  end
end
