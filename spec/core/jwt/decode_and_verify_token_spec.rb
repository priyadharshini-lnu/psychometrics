# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::DecodeAndVerifyToken do
  subject(:call_service) { described_class.call(token: token, public_key: verifier_key) }

  let(:private_key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:public_key_rsa) { private_key.public_key }
  let(:payload) do
    {
      'iss' => '123',
      'jti' => SecureRandom.uuid,
      'aud' => 'https://client.ttedev.me',
      'exp' => Time.current.to_i + 300
    }
  end
  let(:headers) { { kid: 123_456_789_012_345_678, typ: 'JWT' } }
  let(:token) { JWT.encode(payload, private_key, 'RS256', headers) }
  let(:verifier_key) { public_key_rsa.to_pem }

  describe '.call' do
    it 'returns payload and header for valid token and PEM key' do
      result = call_service

      expect(result[:ok][:payload]['iss']).to eq('123')
      expect(result[:ok][:header]['alg']).to eq('RS256')
    end

    it 'accepts an OpenSSL::PKey::RSA public key object' do
      result = described_class.call(token: token, public_key: public_key_rsa)

      expect(result[:ok][:payload]['aud']).to eq('https://client.ttedev.me')
    end

    it 'accepts objects that respond to openssl_key' do
      key_wrapper = Struct.new(:openssl_key).new(public_key_rsa)

      result = described_class.call(token: token, public_key: key_wrapper)
      expect(result[:ok][:payload]['jti']).to eq(payload['jti'])
    end

    it 'returns invalid_token for malformed JWT token' do
      result = described_class.call(token: 'invalid-token', public_key: public_key_rsa)

      expect(result[:error]).to eq(:invalid_token)
    end

    it 'returns invalid_token for malformed public key' do
      result = described_class.call(token: token, public_key: 'not-a-public-key')

      expect(result[:error]).to eq(:invalid_token)
    end

    it 'does not enforce expiration in this command' do
      expired_token = JWT.encode(payload.merge('exp' => Time.current.to_i - 10), private_key, 'RS256', headers)

      result = described_class.call(token: expired_token, public_key: public_key_rsa)
      expect(result[:ok][:payload]['exp']).to be < Time.current.to_i
    end
  end
end
