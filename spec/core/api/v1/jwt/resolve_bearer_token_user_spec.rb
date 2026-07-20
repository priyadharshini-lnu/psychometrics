# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::Jwt::ResolveBearerTokenUser do
  include_context 'api v1 jwt setup'
  let(:token_aud) { Utility::Url.generate(:root_url, subdomain: application_user.memberships.first.client.subdomain).chomp('/') }

  subject(:call_service) do
    described_class.call(
      token: token
    )
  end

  describe '.call' do
    context 'with a valid reusable token' do
      it 'resolves user successfully' do
        result = call_service

        expect(result[:ok]).to eq(application_user)
      end
    end

    context 'with single_use=true' do
      before do
        payload[:single_use] = true
        allow(Jwt::SingleUse::SingleUseJtiGuard).to receive(:call).and_return({ ok: true })
      end

      it 'calls replay guard and succeeds' do
        result = call_service

        expect(result[:ok]).to eq(application_user)
      end
    end

    context 'when audience is wrong' do
      let(:token_aud) { 'https://wrong.ttedev.me:3030' }

      it 'returns audience_mismatch error' do
        expect(call_service[:error]).to eq(:audience_mismatch)
      end
    end

    context 'when token is expired' do
      before { payload[:exp] = now - 1 }

      it 'returns token_expired error' do
        expect(call_service[:error]).to eq(:expired_token)
      end
    end

    context 'when signing key cannot be resolved' do
      before do
        allow(Jwt::ResolvePublicKey).to receive(:call).and_return({ error: :invalid_token })
      end

      it 'returns invalid_signing_key instead of raising' do
        expect(call_service[:error]).to eq(:invalid_signing_key)
      end
    end

    context 'when signing key resolution has no public_key' do
      before do
        allow(Jwt::ResolvePublicKey).to receive(:call).and_return({ ok: { application: application_user } })
      end

      it 'returns invalid_signing_key' do
        expect(call_service[:error]).to eq(:invalid_signing_key)
      end
    end
  end
end
