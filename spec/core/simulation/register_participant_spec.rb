# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::RegisterParticipant, type: :service do
  let(:assessment) { create(:assessment, :simulation) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }

  let(:client) { double('Client') }
  let(:service) { described_class.new(user_assessment) }

  before do
    allow(service).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when the response status is 200' do
      let(:response) { double('Response', status: 200, body: { id: 'participant_id' }.to_json) }

      before do
        allow(client).to receive(:put).and_return(response)
        allow(service).to receive(:broadcast)
      end

      it 'updates the participant_id' do
        service.call

        expect(simulation_user_assessment.reload.participant_id).to eq('participant_id')
      end

      it 'broadcasts :ok' do
        expect(service).to receive(:broadcast).with(:ok)
        service.call
      end
    end

    context 'when the response status is not 200' do
      let(:response) { double('Response', status: 500, body: 'Internal Server Error') }

      before do
        allow(client).to receive(:put).and_return(response)
      end

      it 'raises RegisterParticipantFailed error' do
        expect do
          service.call
        end.to raise_error(
          Simulation::Exceptions::RegisterParticipantFailed,
          "Simulation::RegisterParticipant failed for Assessment: #{user_assessment.id}. Error: Internal Server Error"
        )
      end
    end
  end
end
