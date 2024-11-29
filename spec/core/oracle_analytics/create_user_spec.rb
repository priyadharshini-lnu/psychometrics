# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OracleAnalytics::CreateUser do
  let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }
  let(:service) { described_class.new(user) }
  let(:client) { double('Client') }
  let(:response_body) { { 'id' => '123', 'userName' => "#{ENV.fetch('REAL_ENV', nil)}-#{user.id}" } }
  let(:config) { { base_api_url: 'https://api.example.com', oac_default_user_email: 'default@example.com' } }

  before do
    allow(service).to receive(:client).and_return(client)
    allow(service).to receive(:config).and_return(config)
    allow(OracleAnalytics::AddUserToGroup).to receive(:call)
  end

  describe '#call' do
    context 'when user is created successfully' do
      let(:response) do
        double('Response', status: 201, body: response_body.to_json)
      end

      before do
        allow(client).to receive(:post).and_return(response)
      end

      it 'updates the participant_id' do
        service.call

        expect(OracleCredential.last.idcs_user_id).to eq('123')
      end

      it 'calls AddUserToGroup service' do
        service.call

        expect(OracleAnalytics::AddUserToGroup).to have_received(:call).with(OracleCredential.last)
      end
    end

    context 'when user creation fails' do
      let(:response) do
        double('Response', status: 400, body: { error: 'Failed to create user' }.to_json)
      end

      before do
        allow(client).to receive(:post).and_return(response)
      end

      it 'logs an error message' do
        expect(Rails.logger).to receive(:error).with("Failed to create user. Error: #{response.body}")
        service.call
      end

      it 'returns error response with error key' do
        expect(service).to receive(:broadcast).with(:error, { 'error' => 'Failed to create user' })
        service.call
      end
    end
  end
end
