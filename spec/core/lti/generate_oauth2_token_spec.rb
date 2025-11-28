# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::GenerateOauth2Token do
  let(:project) { create(:project) }
  let(:form) do
    double('form',
           valid?: true,
           scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
           client_assertion: jwt_token,
           error_response: false)
  end
  let(:jwt_token) do
    JWT.encode({ iss: 'test-issuer', aud: 'test-audience', exp: 1.hour.from_now.to_i }, 'secret')
  end
  let(:request) { double('request', remote_ip: '127.0.0.1', user_agent: 'Test') }

  before do
    allow_any_instance_of(described_class).to receive(:validate_jwt_assertion).and_return(project.id)
    allow(Lti::Oauth2AccessToken).to receive(:create_token).and_return({
      raw_token: 'test_token_123',
      token_type: 'Bearer',
      expires_in: 3600
    })
  end

  describe '#call' do
    subject { described_class.new(form, request) }

    context 'with valid form and authentication' do
      before do
        allow(subject).to receive(:validate_jwt_assertion).and_return(project.id)
      end

      it 'succeeds without error' do
        expect { subject.call }.not_to raise_error
      end

      it 'creates OAuth2 access token' do
        expect { subject.call }.not_to change(Lti::Oauth2AccessToken, :count)
      end

      it 'returns successful response structure' do
        result = subject.call
        expect(result).to be_a(Hash)
        expect(result).to have_key(:ok)

        token_data = result[:ok]
        expect(token_data).to have_key(:access_token)
        expect(token_data).to have_key(:token_type)
        expect(token_data).to have_key(:expires_in)
        expect(token_data).to have_key(:scope)
      end

      it 'returns properly structured OAuth2 access token response' do
        result = subject.call
        token_response = result[:ok]

        # Verify OAuth2 token response structure (using symbol keys)
        expect(token_response).to be_a(Hash)
        expect(token_response).to have_key(:access_token)
        expect(token_response).to have_key(:token_type)
        expect(token_response).to have_key(:expires_in)
        expect(token_response).to have_key(:scope)

        # Verify token values
        expect(token_response[:access_token]).to be_a(String)
        expect(token_response[:access_token]).not_to be_empty
        expect(token_response[:token_type]).to eq('Bearer')
        expect(token_response[:expires_in]).to be_a(Integer)
        expect(token_response[:expires_in]).to be > 0
        expect(token_response[:scope]).to eq('https://purl.imsglobal.org/spec/lti-ags/scope/score')
      end

      it 'validates token expiration time is reasonable' do
        result = subject.call
        token_response = result[:ok]

        # Token should expire in 1 hour (3600 seconds)
        expect(token_response[:expires_in]).to eq(3600)
      end

      it 'includes correct scope in response' do
        result = subject.call
        token_response = result[:ok]

        expect(token_response[:scope]).to eq(form.scope)
      end
    end

    context 'with invalid form' do
      before do
        allow(form).to receive(:valid?).and_return(false)
        allow(form).to receive(:error_response).and_return({
          'error' => 'invalid_request',
          'error_description' => 'Invalid form data'
        })
      end

      it 'returns error response without broadcasting' do
        result = subject.call
        expect(result).to eq({
          'error' => 'invalid_request',
          'error_description' => 'Invalid form data'
        })
      end

      it 'does not create OAuth2 access token' do
        expect { subject.call }.not_to change(Lti::Oauth2AccessToken, :count)
      end
    end

    context 'with authentication failure' do
      before do
        allow(subject).to receive(:validate_jwt_assertion).and_return(nil)
      end

      it 'succeeds without error' do
        expect { subject.call }.not_to raise_error
      end
    end
  end
end
