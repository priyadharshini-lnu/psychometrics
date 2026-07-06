# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::ValidateStandardClaims do
  subject(:call_service) { described_class.call(payload: payload, expected_audience: expected_audience) }

  let(:expected_audience) { 'https://client.ttedev.me' }
  let(:payload) do
    {
      'iss' => '123',
      'jti' => SecureRandom.uuid,
      'aud' => 'https://client.ttedev.me',
      'exp' => Time.current.to_i + 300
    }
  end

  describe '.call' do
    it 'returns ok for valid claims' do
      result = call_service

      expect(result[:ok]).to eq(payload)
    end

    it 'returns missing_exp when exp is absent' do
      payload.delete('exp')

      expect(call_service[:error]).to eq(:missing_exp)
    end

    it 'returns expired_token for expired tokens' do
      payload['exp'] = Time.current.to_i - 1

      expect(call_service[:error]).to eq(:expired_token)
    end

    it 'returns expiry_too_long when exp exceeds max window' do
      payload['exp'] = Time.current.to_i + 3601

      expect(call_service[:error]).to eq(:expiry_too_long)
    end

    it 'returns audience_mismatch when audience does not match expected' do
      payload['aud'] = 'https://other.ttedev.me'

      expect(call_service[:error]).to eq(:audience_mismatch)
    end

    it 'returns invalid_audience_format when audience has query parameters' do
      payload['aud'] = 'https://client.ttedev.me?x=1'

      expect(call_service[:error]).to eq(:invalid_audience_format)
    end

    it 'returns invalid_single_use_claim when single_use is not boolean' do
      payload['single_use'] = 'true'

      expect(call_service[:error]).to eq(:invalid_single_use_claim)
    end

    it 'returns invalid_iat when iat is not integer-like' do
      payload['iat'] = 'abc'

      expect(call_service[:error]).to eq(:invalid_iat)
    end
  end
end
