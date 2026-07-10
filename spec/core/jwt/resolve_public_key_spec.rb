# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::ResolvePublicKey do
  include_context 'api v1 jwt setup'

  subject(:call_service) { described_class.call(token: token) }

  describe '.call' do
    it 'returns application and public key for a valid token' do
      result = call_service

      expect(result[:ok][:application]).to eq(application_user)
      expect(result[:ok][:public_key]).to eq(public_key)
    end

    it 'returns invalid_token when token cannot be decoded' do
      result = described_class.call(token: 'invalid.token')

      expect(result[:error]).to eq(:invalid_token)
    end

    it 'returns invalid_key_id for non-numeric kid' do
      invalid_token = JWT.encode(payload, private_key, 'RS256', headers.merge(kid: 'invalid-kid'))
      result = described_class.call(token: invalid_token)

      expect(result[:error]).to eq(:invalid_key_id)
    end

    it 'returns invalid_application when application cannot be resolved' do
      invalid_token = JWT.encode(payload, private_key, 'RS256', headers.merge(kid: 999_999_999))
      result = described_class.call(token: invalid_token)

      expect(result[:error]).to eq(:invalid_application)
    end

    it 'returns invalid_public_key when resolved application has no matching active key' do
      stale_key_id = 111_111
      token_with_stale_kid = JWT.encode(payload, private_key, 'RS256', headers.merge(kid: stale_key_id))
      allow(Jwt::ResolveApplication).to receive(:call!).and_return(application_user)

      result = described_class.call(token: token_with_stale_kid)

      expect(result[:error]).to eq(:invalid_public_key)
    end
  end
end
