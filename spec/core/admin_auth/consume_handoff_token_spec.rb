# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::ConsumeHandoffToken do
  let(:user) { create(:superadmin) }
  let(:client) { create(:tenancy) }

  def generate_token(user, client, impersonating: false, expires_at: 2.minutes.from_now)
    nonce = SecureRandom.urlsafe_base64(24)
    payload = {
      user_id: user.id,
      client_id: client.id,
      nonce: nonce,
      impersonated_by_id: impersonating ? user.id : nil,
      exp: expires_at.to_i
    }
    token = Rails.application.message_verifier('admin_handoff_token').generate(payload)
    $redis.set("admin_handoff:#{nonce}", '1', ex: 120)
    token
  end

  describe '.call' do
    context 'with valid token' do
      it 'returns user and client data' do
        token = generate_token(user, client)

        result = described_class.call(token, expected_client_id: client.id)

        expect(result[:ok]).to include(
          user: user,
          client_id: client.id,
          impersonated_by_id: nil
        )
      end

      it 'returns impersonated_by_id when present' do
        token = generate_token(user, client, impersonating: true)

        result = described_class.call(token, expected_client_id: client.id)

        expect(result[:ok][:impersonated_by_id]).to eq(user.id)
      end

      it 'consumes the nonce (single-use)' do
        token = generate_token(user, client)

        # First call succeeds
        result1 = described_class.call(token, expected_client_id: client.id)
        expect(result1[:ok]).to be_present

        # Second call fails
        result2 = described_class.call(token, expected_client_id: client.id)
        expect(result2[:error]).to eq(:already_used)
      end
    end

    context 'with blank token' do
      it 'returns error' do
        result = described_class.call('', expected_client_id: client.id)

        expect(result[:error]).to eq(:blank_token)
      end

      it 'returns error for nil token' do
        result = described_class.call(nil, expected_client_id: client.id)

        expect(result[:error]).to eq(:blank_token)
      end
    end

    context 'with expired token' do
      it 'returns error' do
        token = generate_token(user, client, expires_at: 1.minute.ago)

        result = described_class.call(token, expected_client_id: client.id)

        expect(result[:error]).to eq(:expired)
      end
    end

    context 'with client mismatch' do
      let(:other_client) { create(:tenancy) }

      it 'returns error when token is for different client' do
        token = generate_token(user, client)

        result = described_class.call(token, expected_client_id: other_client.id)

        expect(result[:error]).to eq(:client_mismatch)
      end
    end

    context 'with invalid signature' do
      it 'returns error for tampered token' do
        result = described_class.call('tampered_token', expected_client_id: client.id)

        expect(result[:error]).to eq(:invalid_token)
      end
    end

    context 'with disabled user' do
      it 'returns error' do
        token = generate_token(user, client)
        user.update!(disabled: true)

        result = described_class.call(token, expected_client_id: client.id)

        expect(result[:error]).to eq(:user_disabled)
      end
    end

    context 'with non-existent user' do
      it 'returns error' do
        token = generate_token(user, client)
        user.destroy

        result = described_class.call(token, expected_client_id: client.id)

        expect(result[:error]).to eq(:user_not_found)
      end
    end

    context 'with missing nonce in cache' do
      it 'returns error when nonce was never stored' do
        nonce = SecureRandom.urlsafe_base64(24)
        payload = {
          user_id: user.id,
          client_id: client.id,
          nonce: nonce,
          impersonated_by_id: nil,
          exp: 2.minutes.from_now.to_i
        }
        token = Rails.application.message_verifier('admin_handoff_token').generate(payload)
        # NOTE: NOT storing nonce in cache

        result = described_class.call(token, expected_client_id: client.id)

        expect(result[:error]).to eq(:already_used)
      end
    end
  end
end
