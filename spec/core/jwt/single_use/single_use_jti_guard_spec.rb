# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::SingleUse::SingleUseJtiGuard do
  subject(:call_service) do
    described_class.call(
      token_type: token_type,
      issuer: issuer,
      jti: jti,
      exp: exp,
      single_use: single_use
    )
  end

  let(:token_type) { :api_v1 }
  let(:issuer) { 39_267 }
  let(:jti) { SecureRandom.uuid }
  let(:single_use) { true }
  let(:now) { Time.current.to_i }
  let(:exp) { now + 300 }
  let(:redis) { double('redis') }

  around do |example|
    original_redis = $redis # rubocop:disable Style/GlobalVars
    $redis = redis # rubocop:disable Style/GlobalVars
    example.run
    $redis = original_redis # rubocop:disable Style/GlobalVars
  end

  before do
    allow(Time).to receive(:current).and_return(Time.zone.at(now))
  end

  describe '.call' do
    context 'when single_use is false' do
      let(:single_use) { false }

      it 'returns ok without reserving a redis key' do
        expect(redis).not_to receive(:set)

        expect(call_service).to include(ok: [])
      end
    end

    context 'when token is used for the first time' do
      before do
        allow(redis).to receive(:set).and_return(true)
      end

      it 'stores the replay key and succeeds' do
        expect(call_service).to include(ok: [])

        expect(redis).to have_received(:set).with(
          "api:v1:jwt:jti:#{issuer}:#{jti}",
          '1',
          nx: true,
          ex: exp - now
        )
      end
    end

    context 'when token has already been used' do
      before do
        allow(redis).to receive(:set).and_return(false)
      end

      it 'returns replayed result' do
        expect(call_service).to include(replayed: { reason: :replayed })
      end
    end

    context 'when token is already expired' do
      let(:exp) { now }

      it 'returns expired replay result' do
        expect(call_service).to include(replayed: { reason: :expired })
      end
    end

    context 'when ttl would be negative' do
      let(:exp) { now - 10 }

      it 'returns expired replay result' do
        expect(call_service).to include(replayed: { reason: :expired })
      end
    end

    context 'when same jti is used by a different issuer' do
      let(:shared_jti) { SecureRandom.uuid }

      it 'uses a different redis key' do
        allow(redis).to receive(:set).and_return(true)

        described_class.call(token_type: :api_v1, issuer: 100, jti: shared_jti, exp: now + 300, single_use: true)
        described_class.call(token_type: :api_v1, issuer: 200, jti: shared_jti, exp: now + 300, single_use: true)

        expect(redis).to have_received(:set).with(
          "api:v1:jwt:jti:100:#{shared_jti}",
          '1',
          nx: true,
          ex: 300
        )

        expect(redis).to have_received(:set).with(
          "api:v1:jwt:jti:200:#{shared_jti}",
          '1',
          nx: true,
          ex: 300
        )
      end
    end
  end
end
