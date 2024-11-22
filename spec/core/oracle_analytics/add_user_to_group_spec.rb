# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OracleAnalytics::AddUserToGroup do
  let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }
  let(:oracle_credential) { create(:oracle_credential, user: user) }

  let(:service) { described_class.new(oracle_credential) }
  let(:client) { double('Client') }
  let(:response_body) { { 'id' => 'group_id' } }
  let(:config) { { base_api_url: 'https://api.example.com', analytics_viewers_group_id: 'analytics_viewers_group_id' } }

  before do
    allow(service).to receive(:client).and_return(client)
    allow(service).to receive(:config).and_return(config)
    allow(service).to receive(:broadcast)
  end

  describe '#call' do
    context 'when user is created successfully' do
      let(:response) do
        double('Response', status: 200, body: response_body.to_json)
      end

      before do
        allow(client).to receive(:patch).and_return(response)
      end

      it 'updates the group and return ok' do
        service.call

        expect(service).to have_received(:broadcast).with(:ok)
      end
    end

    context 'when user creation fails' do
      let(:response) do
        double('Response', status: 400, body: { error: 'Failed to create user' }.to_json)
      end

      before do
        allow(client).to receive(:patch).and_return(response)
      end

      it 'logs an error message' do
        expect(Rails.logger).to receive(:error).
          with("Failed to add user to analytics_viewers_group. Error: #{response.body}")
        service.call
      end
    end
  end
end
