# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ValidateClaims do
  subject(:call_service) do
    described_class.call(payload: payload, header: header, expected_audience: expected_audience)
  end

  let(:expected_audience) { "#{Settings.protocol}://client.#{Settings.domain}" }
  let(:header) { { 'alg' => 'RS256' } }
  let(:payload) do
    {
      'iss' => '123',
      'jti' => SecureRandom.uuid,
      'aud' => expected_audience,
      'exp' => 15.minutes.from_now.to_i,
      'sub' => '42',
      'kid' => '1001',
      'tg' => 'cmp',
      'tg_cmp_id' => '77'
    }
  end

  describe '.call' do
    it 'returns normalized claims for a valid payload' do
      result = call_service

      expect(result[:ok]).to include(payload)
      expect(result[:ok]['single_use']).to eq(false)
    end

    it 'returns missing_campaign_id when tg_cmp_id is blank' do
      payload['tg_cmp_id'] = nil

      expect(call_service[:error]).to eq(:missing_campaign_id)
    end

    it 'returns invalid_target when tg is unsupported' do
      payload['tg'] = 'other'

      expect(call_service[:error]).to eq(:invalid_target)
    end

    it 'returns missing_assessment_id for assessment targets without tg_asmt_id' do
      payload['tg'] = 'asmt'

      expect(call_service[:error]).to eq(:missing_assessment_id)
    end

    it 'returns audience_mismatch when audience does not match expected audience' do
      payload['aud'] = "#{Settings.protocol}://other.#{Settings.domain}"

      expect(call_service[:error]).to eq(:audience_mismatch)
    end
  end
end
