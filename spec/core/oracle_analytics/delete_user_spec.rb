# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OracleAnalytics::DeleteUser do
  let!(:user) { create(:user) }
  let!(:oracle_credential) { create(:oracle_credential, user: user) }
  let(:service) { described_class.new(user) }
  let(:client) { double('Client') }
  let(:response) { double('Response', status: status) }

  before do
    allow(service).to receive(:client).and_return(client)
    allow(service).to receive(:broadcast)
    if oracle_credential
      allow(oracle_credential).to receive(:destroy)
    end
  end

  describe '#call' do
    context 'when oracle credential is empty' do
      let(:oracle_credential) { nil }
      let(:user) { create(:user, oracle_credential: oracle_credential) }

      it 'broadcasts ok' do
        service.call
        expect(service).to have_received(:broadcast).with(:ok)
      end
    end

    context 'when delete user request is successful' do
      let(:status) { 204 }

      it 'deletes the user via the client' do
        expect(client).to receive(:delete).with("/admin/v1/Users/#{oracle_credential.idcs_user_id}").
          and_return(response)

        service.call

        expect(oracle_credential).to have_received(:destroy)
        expect(service).to have_received(:broadcast).with(:ok)
      end
    end

    context 'when delete user request fails' do
      let(:status) { 500 }

      it 'logs an error and broadcasts error' do
        allow(client).to receive(:delete).and_return(response)

        expect(Rails.logger).to receive(:error).with("Failed to delete user. Error: #{response}")
        expect(service).to receive(:broadcast).with(:error, response)

        service.call
      end
    end
  end
end
