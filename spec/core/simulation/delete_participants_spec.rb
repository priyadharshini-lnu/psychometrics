# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::DeleteParticipants, type: :service do
  let(:project_id) { 280 }
  let(:delete_participants) { described_class.new(project_id) }
  let(:client) { double('Client') }
  let(:response) { double('Response', status: response_status, body: response_body) }
  let(:response_status) { 200 }
  let(:response_body) { 'Success' }

  before do
    allow(delete_participants).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when the response status is 200' do
      before do
        allow(client).to receive(:delete).and_return(response)
        allow(delete_participants).to receive(:broadcast)
      end

      it 'sets the request body and broadcasts :ok' do
        expect(delete_participants).to receive(:broadcast).with(:ok)
        delete_participants.call
      end
    end

    context 'when the response status is not 200' do
      let(:response_status) { 400 }
      let(:response_body) { 'Error' }

      before do
        allow(client).to receive(:delete).and_return(response)
      end

      it 'sets the request body and raises DeleteParticipantsFailed error' do
        expect do
          delete_participants.call
        end.to raise_error(
          Simulation::Exceptions::DeleteParticipantsFailed,
          "Simulation::DeleteParticipantsFailed failed for project id: #{project_id}. Error: #{response_body}"
        )
      end
    end
  end
end
