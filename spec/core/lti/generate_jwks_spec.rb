# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::GenerateJwks do
  let(:private_key) { OpenSSL::PKey::RSA.new(2048) }
  let(:private_key_pem) { private_key.to_pem }

  before do
    # Clear cache before each test
    Rails.cache.clear
    allow(ENV).to receive(:fetch).with('LTI_PRIVATE_KEY', '').and_return(private_key_pem)
  end

  describe '#call' do
    subject { described_class.new }

    it 'returns the correct JWKS structure' do
      expected_jwks = hash_including(
        :keys => array_including(
          hash_including(
            :kty => 'RSA',
            :use => 'sig',
            :alg => 'RS256',
            :kid => a_string_matching(/\A[0-9a-f]{22}\z/),
            :n => be_present,
            :e => be_present
          )
        )
      )

      expect(subject).to broadcast(:ok, expected_jwks)
    end

    it 'returns JWKS data with correct structure' do
      result = subject.call

      expect(result[:ok]).to have_key(:keys)
      expect(result[:ok][:keys]).to be_an(Array)
      expect(result[:ok][:keys].length).to eq(1)

      key = result[:ok][:keys].first
      expect(key).to have_key(:kty)
      expect(key[:kty]).to eq('RSA')
      expect(key).to have_key(:kid)
      expect(key[:kid]).to be_present
      expect(key).to have_key(:use)
      expect(key[:use]).to eq('sig')
      expect(key).to have_key(:alg)
      expect(key[:alg]).to eq('RS256')
      expect(key).to have_key(:n)
      expect(key).to have_key(:e)
    end

    it 'generates a key_id from the private key SHA-256 hash' do
      result = subject.call
      key = result[:ok][:keys].first

      expect(key[:kid]).to be_present
      expect(key[:kid].length).to eq(22) # Truncated SHA-256 hex string
      # Ensure it's a valid hex string
      expect(key[:kid]).to match(/\A[0-9a-f]+\z/)
    end

    context 'when LTI private key is not configured' do
      before do
        allow(ENV).to receive(:fetch).with('LTI_PRIVATE_KEY', '').and_return('')
      end

      it 'returns error with error message' do
        expect(subject).to broadcast(:error, /LTI private key not configured/)
      end
    end

    context 'when an error occurs' do
      before do
        allow(ENV).to receive(:fetch).with('LTI_PRIVATE_KEY', '').and_return('invalid key')
        allow_any_instance_of(described_class).to receive(:jwks_data).and_raise(StandardError, 'Test error')
      end

      it 'returns error with error message' do
        expect(subject).to broadcast(:error, 'Test error')
      end
    end
  end
end
