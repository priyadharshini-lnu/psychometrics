# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JwtAuthenticator do
  describe '.authenticate' do
    let(:user) { create(:user) }
    let(:api_key) { create(:api_key, user: user) }
    let(:jwt_key) do
      JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i + 20 }, api_key.token, 'HS256',
                 { 'api_key' => api_key.key })
    end

    context 'when the JWT key is valid' do
      context 'when user_id is passed as subject' do
        it 'returns the user' do
          expect(JwtAuthenticator.authenticate(jwt_key)).to eq(user)
        end
      end

      context 'when user email is passed as subject' do
        let(:jwt_key) do
          JWT.encode({ 'sub' => user.email, 'exp' => Time.now.to_i + 20 }, api_key.token, 'HS256',
                     { 'api_key' => api_key.key })
        end

        it 'returns the user' do
          expect(JwtAuthenticator.authenticate(jwt_key)).to eq(user)
        end
      end
    end

    context 'when the JWT key is invalid' do
      let(:jwt_key) { 'invalid' }

      it 'returns nil' do
        expect(JwtAuthenticator.authenticate(jwt_key)).to be_nil
      end
    end

    context 'when the JWT key is expired' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i - 1 }, api_key.token,
                   'HS256', { 'api_key' => api_key.key })
      end

      it 'returns nil' do
        expect(JwtAuthenticator.authenticate(jwt_key)).to be_nil
      end
    end

    context 'when the JWT key has an expiration time more than 30 minutes in the future' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id, 'exp' => 35.minutes.from_now.to_i }, api_key.token,
                   'HS256', { 'api_key' => api_key.key })
      end

      it 'returns nil' do
        expect(JwtAuthenticator.authenticate(jwt_key)).to be_nil
      end
    end

    context 'when the JWT key does not have an expiration time' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id }, api_key.token, 'HS256', { 'api_key' => api_key.key })
      end

      it 'returns nil' do
        expect(JwtAuthenticator.authenticate(jwt_key)).to be_nil
      end
    end
  end
end
