# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JwtAuthenticator do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }
  let(:application_user) { create(:application_user) }
  let(:api_key) { create(:api_key, user: application_user) }

  describe '.get_user_by_client_jwt' do
    let(:jwt_key) do
      JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i + 20 }, api_key.token, 'HS256',
                 { 'api_key' => api_key.key })
    end

    context 'when the JWT key is valid' do
      it 'returns the user' do
        expect(JwtAuthenticator.get_user_by_client_jwt(jwt_key, api_key, project)).to eq(user)
      end
    end

    context 'when the JWT key is invalid' do
      let(:jwt_key) { 'invalid' }

      it 'returns nil' do
        expect(JwtAuthenticator.get_user_by_client_jwt(jwt_key, api_key, project)).to be_nil
      end
    end

    context 'when the JWT key is expired' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i - 1 }, api_key.token, 'HS256',
                   { 'api_key' => api_key.key })
      end

      it 'returns nil' do
        expect(JwtAuthenticator.get_user_by_client_jwt(jwt_key, api_key, project)).to be_nil
      end
    end

    context 'when the JWT key has an expiration time more than 30 days in the future' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id, 'exp' => 31.days.from_now.to_i }, api_key.token, 'HS256',
                   { 'api_key' => api_key.key })
      end

      it 'returns nil' do
        expect(JwtAuthenticator.get_user_by_client_jwt(jwt_key, api_key, project)).to be_nil
      end
    end

    context 'when the JWT key does not have an expiration time' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id }, api_key.token, 'HS256', { 'api_key' => api_key.key })
      end

      it 'returns nil' do
        expect(JwtAuthenticator.get_user_by_client_jwt(jwt_key, api_key, project)).to be_nil
      end
    end
  end

  describe '.get_user_by_lighthouse_jwt' do
    let(:encrypted_key) { Settings.secrets.encrypted_key }
    let(:jwt_key) do
      JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i + 20 }, encrypted_key, 'HS256')
    end

    context 'when the JWT key is valid' do
      it 'returns the user' do
        returned_user = JwtAuthenticator.get_user_by_lighthouse_jwt(jwt_key, project)

        expect(returned_user).to eq(user)
      end
    end

    context 'when the JWT key is invalid' do
      let(:jwt_key) { 'invalid' }

      it 'returns nil' do
        returned_user = JwtAuthenticator.get_user_by_lighthouse_jwt(jwt_key, project)

        expect(returned_user).to be_nil
      end
    end

    context 'when the JWT key is expired' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i - 1 }, encrypted_key, 'HS256')
      end

      it 'returns nil if token is expired' do
        returned_user = JwtAuthenticator.get_user_by_lighthouse_jwt(jwt_key, project)

        expect(returned_user).to eq(nil)
      end
    end

    context 'when the JWT key does not have an expiration time' do
      let(:jwt_key) do
        JWT.encode({ 'sub' => user.id }, encrypted_key, 'HS256')
      end

      it 'returns nil' do
        expect(JwtAuthenticator.get_user_by_lighthouse_jwt(jwt_key, project)).to be_nil
      end
    end
  end
end
