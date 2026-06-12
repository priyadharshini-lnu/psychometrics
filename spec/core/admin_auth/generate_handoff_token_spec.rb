# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::GenerateHandoffToken do
  let(:user) { create(:superadmin) }
  let(:client) { create(:tenancy) }

  def decode_token(token)
    payload = Rails.application.message_verifier('admin_handoff_token').verify(token)
    payload.with_indifferent_access
  end

  describe '.call' do
    context 'with valid user and client' do
      it 'returns a token' do
        result = described_class.call(user, client)

        expect(result[:ok]).to be_present
        expect(result[:ok]).to be_a(String)
      end

      it 'stores nonce in redis for single-use verification' do
        result = described_class.call(user, client)
        token = result[:ok]
        payload = decode_token(token)

        expect($redis.get("admin_handoff:#{payload[:nonce]}")).to eq('1')
      end

      it 'includes user_id in the token payload' do
        result = described_class.call(user, client)
        token = result[:ok]
        payload = decode_token(token)

        expect(payload[:user_id]).to eq(user.id)
      end

      it 'includes client_id in the token payload' do
        result = described_class.call(user, client)
        token = result[:ok]
        payload = decode_token(token)

        expect(payload[:client_id]).to eq(client.id)
      end

      it 'sets expiry in the token payload' do
        result = described_class.call(user, client)
        token = result[:ok]
        payload = decode_token(token)

        expect(payload[:exp]).to be > Time.current.to_i
        expect(payload[:exp]).to be <= 2.minutes.from_now.to_i
      end
    end

    context 'with impersonated_by' do
      let(:impersonator) { create(:superadmin) }

      it 'includes impersonated_by_id when impersonated_by is provided' do
        result = described_class.call(user, client, impersonated_by: impersonator)
        token = result[:ok]
        payload = decode_token(token)

        expect(payload[:impersonated_by_id]).to eq(impersonator.id)
      end

      it 'does not include impersonated_by_id when not provided' do
        result = described_class.call(user, client)
        token = result[:ok]
        payload = decode_token(token)

        expect(payload[:impersonated_by_id]).to be_nil
      end
    end

    context 'with invalid user' do
      it 'returns error for nil user' do
        result = described_class.call(nil, client)

        expect(result[:error]).to eq(:invalid_user)
      end

      it 'returns error for disabled user' do
        user.update!(disabled: true)
        result = described_class.call(user, client)

        expect(result[:error]).to eq(:invalid_user)
      end
    end

    context 'with invalid client' do
      it 'returns error for nil client' do
        result = described_class.call(user, nil)

        expect(result[:error]).to eq(:invalid_client)
      end

      it 'returns error for inactive client' do
        client.update!(disabled: true, archived: true)
        result = described_class.call(user, client)

        expect(result[:error]).to eq(:invalid_client)
      end
    end
  end
end
