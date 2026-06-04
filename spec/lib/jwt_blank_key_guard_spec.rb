# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'JWT CVE-2026-45363 Mitigation' do
  let(:payload) { { 'sub' => 'user123', 'exp' => 1.hour.from_now.to_i } }
  let(:valid_secret) { 'my_secret_key' }
  let(:valid_token) { JWT.encode(payload, valid_secret, 'HS256') }

  describe 'CVE-2026-45363 attack scenario' do
    let(:forged_token) do
      # Manually construct a JWT signed with an empty HMAC key to simulate an attacker-forged
      # token. jwt >= 2.10.3 refuses to encode with a blank key, so we build the token by hand.
      header    = Base64.urlsafe_encode64('{"alg":"HS256","typ":"JWT"}', padding: false)
      body      = Base64.urlsafe_encode64(
        { 'sub' => 'attacker', 'role' => 'admin', 'exp' => 1.hour.from_now.to_i }.to_json,
        padding: false
      )
      signing_input = "#{header}.#{body}"
      signature = Base64.urlsafe_encode64(
        OpenSSL::HMAC.digest('SHA256', '', signing_input),
        padding: false
      )
      "#{signing_input}.#{signature}"
    end

    it 'blocks a forged token signed with an empty key' do
      expect { JWT.decode(forged_token, '', true, algorithms: ['HS256']) }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end
  end

  describe 'JWT.decode with blank key' do
    it 'raises BlankSecretError when key is nil' do
      expect { JWT.decode(valid_token, nil, true, algorithms: ['HS256']) }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end

    it 'raises BlankSecretError when key is empty string' do
      expect { JWT.decode(valid_token, '', true, algorithms: ['HS256']) }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end

    it 'raises BlankSecretError when key is whitespace only' do
      expect { JWT.decode(valid_token, '   ', true, algorithms: ['HS256']) }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end

    it 'does not raise when key is valid' do
      decoded = JWT.decode(valid_token, valid_secret, true, algorithms: ['HS256'])
      expect(decoded.first['sub']).to eq('user123')
    end

    it 'allows nil key when verify is false (unverified decode)' do
      decoded = JWT.decode(valid_token, nil, false)
      expect(decoded.first['sub']).to eq('user123')
    end

    it 'allows keyfinder block with nil key' do
      decoded = JWT.decode(valid_token, nil, true, algorithms: ['HS256']) { valid_secret }
      expect(decoded.first['sub']).to eq('user123')
    end
  end

  describe 'keyfinder with blank secret' do
    it 'raises BlankSecretError when keyfinder returns nil' do
      expect { JWT.decode(valid_token, nil, true, algorithms: ['HS256']) { nil } }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end

    it 'raises BlankSecretError when keyfinder returns empty string' do
      expect { JWT.decode(valid_token, nil, true, algorithms: ['HS256']) { '' } }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end

    it 'raises BlankSecretError when keyfinder returns whitespace only' do
      expect { JWT.decode(valid_token, nil, true, algorithms: ['HS256']) { '   ' } }.
        to raise_error(JwtBlankKeyGuard::BlankSecretError)
    end
  end

  describe 'error inheritance' do
    it 'BlankSecretError inherits from JWT::DecodeError' do
      expect(JwtBlankKeyGuard::BlankSecretError.ancestors).to include(JWT::DecodeError)
    end

    it 'can be rescued as JWT::DecodeError' do
      expect { JWT.decode(valid_token, nil, true, algorithms: ['HS256']) }.
        to raise_error(JWT::DecodeError)
    end
  end
end
