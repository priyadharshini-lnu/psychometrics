# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::ResetAssessment, type: :service do
  let(:assessment) { create(:assessment, :simulation) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }

  let(:client) { double('Client') }
  let(:service) { described_class.new(user_assessment) }

  before do
    allow_any_instance_of(Simulation::RegisterParticipant).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when the response status is 200' do
      let(:response) { double('Response', status: 200, body: { id: 'participant_id' }.to_json) }

      before do
        allow(client).to receive(:put).and_return(response)
        allow(service).to receive(:broadcast)
      end

      it 'updates the participant_id' do
        simulation_user_assessment.update!(participant_id: 'old_participant_id')

        service.call

        expect(simulation_user_assessment.reload.participant_id).to eq('participant_id')
      end

      it 'broadcasts :ok' do
        expect(service).to receive(:broadcast).with(:ok)
        service.call
      end
    end
  end
end
