# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::SamlIntentToken do
  include ActiveSupport::Testing::TimeHelpers

  let(:email) { 'test@example.com' }
  let(:return_url) { '/admin/projects/123' }

  describe '.encode' do
    it 'returns a JWT token string' do
      token = described_class.encode(email: email)

      expect(token).to be_a(String)
      expect(token.split('.').length).to eq(3) # JWT has 3 parts
    end

    it 'includes the email in the payload' do
      token = described_class.encode(email: email)
      result = described_class.decode(token)

      expect(result.email).to eq(email)
    end

    it 'includes return_url when provided' do
      token = described_class.encode(email: email, return_url: return_url)
      result = described_class.decode(token)

      expect(result.return_url).to eq(return_url)
    end

    it 'does not include return_url when not provided' do
      token = described_class.encode(email: email)
      result = described_class.decode(token)

      expect(result.return_url).to be_nil
    end

    it 'sets a default expiry of 5 minutes' do
      freeze_time do
        token = described_class.encode(email: email)
        payload, = JWT.decode(token, Settings.secrets.encrypted_key.to_s, true, algorithms: ['HS256'])

        expect(payload['exp']).to eq(5.minutes.from_now.to_i)
      end
    end

    it 'accepts a custom expiry' do
      freeze_time do
        token = described_class.encode(email: email, expiry: 10.minutes)
        payload, = JWT.decode(token, Settings.secrets.encrypted_key.to_s, true, algorithms: ['HS256'])

        expect(payload['exp']).to eq(10.minutes.from_now.to_i)
      end
    end
  end

  describe '.decode' do
    it 'returns a Result struct with email' do
      token = described_class.encode(email: email)
      result = described_class.decode(token)

      expect(result).to be_a(AdminAuth::SamlIntentToken::Result)
      expect(result.email).to eq(email)
    end

    it 'returns a Result struct with return_url' do
      token = described_class.encode(email: email, return_url: return_url)
      result = described_class.decode(token)

      expect(result.return_url).to eq(return_url)
    end

    it 'returns nil for blank token' do
      expect(described_class.decode(nil)).to be_nil
      expect(described_class.decode('')).to be_nil
    end

    it 'returns nil for expired token' do
      token = described_class.encode(email: email, expiry: -1.minute)

      expect(described_class.decode(token)).to be_nil
    end

    it 'returns nil for tampered token' do
      token = described_class.encode(email: email)
      tampered_token = "#{token}tampered"

      expect(described_class.decode(tampered_token)).to be_nil
    end

    it 'returns nil for malformed token' do
      expect(described_class.decode('not.a.valid.jwt')).to be_nil
    end

    it 'returns nil for token signed with different secret' do
      payload = { email: email, exp: 5.minutes.from_now.to_i }
      token = JWT.encode(payload, 'different_secret', 'HS256')

      expect(described_class.decode(token)).to be_nil
    end
  end

  describe '.email_matches?' do
    context 'when token is blank' do
      it 'returns true (no intent to validate)' do
        expect(described_class.email_matches?(nil, email)).to be(true)
        expect(described_class.email_matches?('', email)).to be(true)
      end
    end

    context 'when token is invalid/expired' do
      it 'returns true (graceful degradation)' do
        expired_token = described_class.encode(email: email, expiry: -1.minute)

        expect(described_class.email_matches?(expired_token, email)).to be(true)
      end
    end

    context 'when email matches' do
      it 'returns true' do
        token = described_class.encode(email: email)

        expect(described_class.email_matches?(token, email)).to be(true)
      end

      it 'is case-insensitive' do
        token = described_class.encode(email: email.upcase)

        expect(described_class.email_matches?(token, email.downcase)).to be(true)
      end
    end

    context 'when email does not match' do
      it 'returns false' do
        token = described_class.encode(email: 'other@example.com')

        expect(described_class.email_matches?(token, email)).to be(false)
      end
    end
  end
end
